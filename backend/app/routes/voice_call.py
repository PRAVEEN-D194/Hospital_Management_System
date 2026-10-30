from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.admin import Admin
from app.models.voice_call_log import VoiceCallLog
from app.models.voice_call_transcript import VoiceCallTranscript
from app.schemas.voice_call import (
    VoiceCallCreate, VoiceCallUpdate, VoiceCallResponse,
    VoiceCallTranscriptCreate, VoiceCallTranscriptResponse
)
from app.core.dependencies import get_current_admin

router = APIRouter(prefix="/voice-calls", tags=["Voice Calls"])


@router.post("/", response_model=VoiceCallResponse, status_code=status.HTTP_201_CREATED)
def log_voice_call(
    call_data: VoiceCallCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    if call_data.patient_id:
        patient = db.get(Patient, call_data.patient_id)
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    if call_data.appointment_id:
        appointment = db.get(Appointment, call_data.appointment_id)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    new_call = VoiceCallLog(
        phone_number=call_data.phone_number,
        call_language=call_data.call_language,
        call_status=call_data.call_status,
        patient_id=call_data.patient_id,
        appointment_id=call_data.appointment_id,
        started_at=call_data.started_at or datetime.now(timezone.utc)
    )
    db.add(new_call)
    db.commit()
    db.refresh(new_call)
    return new_call


@router.patch("/{call_id}", response_model=VoiceCallResponse, status_code=status.HTTP_200_OK)
def update_voice_call(
    call_id: int,
    call_data: VoiceCallUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    call = db.get(VoiceCallLog, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice call log not found")

    if call_data.patient_id is not None:
        patient = db.get(Patient, call_data.patient_id)
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
        call.patient_id = call_data.patient_id

    if call_data.appointment_id is not None:
        appointment = db.get(Appointment, call_data.appointment_id)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
        call.appointment_id = call_data.appointment_id

    if call_data.call_status is not None:
        call.call_status = call_data.call_status

    if call_data.ended_at is not None:
        call.ended_at = call_data.ended_at

    db.commit()
    db.refresh(call)
    return call


@router.get("/", response_model=list[VoiceCallResponse], status_code=status.HTTP_200_OK)
def list_voice_calls(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return db.query(VoiceCallLog).order_by(VoiceCallLog.created_at.desc()).all()


@router.get("/{call_id}", response_model=VoiceCallResponse, status_code=status.HTTP_200_OK)
def get_voice_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    call = db.get(VoiceCallLog, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice call log not found")
    return call


@router.post("/{call_id}/transcripts", response_model=VoiceCallTranscriptResponse, status_code=status.HTTP_201_CREATED)
def add_transcript_message(
    call_id: int,
    transcript_data: VoiceCallTranscriptCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    call = db.get(VoiceCallLog, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice call log not found")

    new_transcript = VoiceCallTranscript(
        call_id=call_id,
        speaker=transcript_data.speaker,
        message=transcript_data.message,
        language=transcript_data.language
    )
    db.add(new_transcript)
    db.commit()
    db.refresh(new_transcript)
    return new_transcript


@router.get("/{call_id}/transcripts", response_model=list[VoiceCallTranscriptResponse], status_code=status.HTTP_200_OK)
def get_call_transcripts(
    call_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    call = db.get(VoiceCallLog, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice call log not found")

    return db.query(VoiceCallTranscript).filter(
        VoiceCallTranscript.call_id == call_id
    ).order_by(VoiceCallTranscript.timestamp.asc()).all()

