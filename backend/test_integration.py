import datetime
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import Appointment, Notification, VoiceCallLog, VoiceCallTranscript, DoctorSchedule, Doctor, Patient

client = TestClient(app)

def run_tests():
    print("=== 1. Authentication Tests ===")
    # 1. Patient login
    res_p = client.post("/auth/patient/login", json={"phone": "9876543210", "password": "Patient123!"})
    assert res_p.status_code == 200, f"Patient login failed: {res_p.text}"
    p_data = res_p.json()
    patient_token = p_data["access_token"]
    assert p_data["user"]["full_name"] == "Arun Kumar", "Patient user info not returned"
    print("1. Patient login succeeded with user info returned:", p_data["user"]["full_name"])

    # 2. Patient wrong password
    res_p_bad = client.post("/auth/patient/login", json={"phone": "9876543210", "password": "WrongPassword"})
    assert res_p_bad.status_code == 401
    print("2. Patient login with incorrect credentials correctly returned 401")

    # 3. Doctor login
    res_d = client.post("/auth/doctor/login", json={"phone": "1234567890", "password": "Doctor123!"})
    assert res_d.status_code == 200, f"Doctor login failed: {res_d.text}"
    d_data = res_d.json()
    doctor_token = d_data["access_token"]
    assert d_data["user"]["phone"] == "1234567890", "Doctor user info not returned"
    print("3. Doctor login succeeded with user info returned:", d_data["user"]["full_name"])

    # 4. Admin login
    res_a = client.post("/auth/admin/login", json={"username": "admin", "password": "AdminSecurePassword123!"})
    assert res_a.status_code == 200, f"Admin login failed: {res_a.text}"
    a_data = res_a.json()
    admin_token = a_data["access_token"]
    assert a_data["user"]["username"] == "admin", "Admin user info not returned"
    print("4. Admin login succeeded with user info returned:", a_data["user"]["full_name"])

    # 5. Invalid JWT
    res_bad_jwt = client.get("/auth/patient/me", headers={"Authorization": "Bearer bad.token"})
    assert res_bad_jwt.status_code == 401
    print("5. Invalid JWT correctly returned 401")

    # 6. Protected endpoint without token
    res_no_tok = client.get("/auth/patient/me")
    assert res_no_tok.status_code == 401
    print("6. Protected endpoint without token correctly returned 401")

    # 7. Patient attempting admin endpoint
    res_p_adm = client.get("/patients/", headers={"Authorization": f"Bearer {patient_token}"})
    assert res_p_adm.status_code == 403
    print("7. Patient attempting admin endpoint (GET /patients/) correctly returned 403")

    # 8. Doctor attempting admin endpoint
    res_d_adm = client.post("/doctors/", json={"full_name": "test", "specialization": "x", "phone": "999", "password": "pass"}, headers={"Authorization": f"Bearer {doctor_token}"})
    assert res_d_adm.status_code == 403
    print("8. Doctor attempting admin endpoint (POST /doctors/) correctly returned 403")

    # 9. Admin accessing admin endpoint
    res_a_adm = client.get("/patients/", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_a_adm.status_code == 200
    print("9. Admin accessing admin endpoint (GET /patients/) succeeded with 200")

    # 10. Patient accessing another patient records
    res_p_other = client.get("/patients/2", headers={"Authorization": f"Bearer {patient_token}"})
    assert res_p_other.status_code == 403
    print("10. Patient accessing another patient record correctly returned 403")

    print("\n=== 2. Backend Integration Tests ===")
    # B1. Patient registration and retrieval
    reg_p = client.post("/patients/", json={
        "full_name": "Integration Patient",
        "phone": "9898001122",
        "email": "integ_patient@example.com",
        "password": "Password123!",
        "preferred_language": "en"
    })
    assert reg_p.status_code == 201, f"Reg patient failed: {reg_p.text}"
    new_pat_id = reg_p.json()["patient_id"]
    print("B1. Patient registration successful: id =", new_pat_id)

    # Login with new patient
    new_p_token = client.post("/auth/patient/login", json={"phone": "9898001122", "password": "Password123!"}).json()["access_token"]
    get_new_p = client.get(f"/patients/{new_pat_id}", headers={"Authorization": f"Bearer {new_p_token}"})
    assert get_new_p.status_code == 200
    print("B1b. New patient retrieved own profile successfully!")

    # B2. Doctor creation and retrieval
    create_doc = client.post("/doctors/", json={
        "full_name": "Dr. Integration Doctor",
        "specialization": "Orthopedics",
        "phone": "9898003344",
        "email": "integ_doc@example.com",
        "password": "DoctorPassword123!",
        "consultation_fee": 700.0
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert create_doc.status_code == 201, f"Doc creation failed: {create_doc.text}"
    new_doc_id = create_doc.json()["doctor_id"]
    print("B2. Doctor creation successful: id =", new_doc_id)

    # B3. Doctor schedule creation
    today = datetime.date.today()
    next_monday = today + datetime.timedelta(days=(0 - today.weekday()) % 7)
    if next_monday <= today:
        next_monday += datetime.timedelta(days=7)

    sched_res = client.post("/doctor-schedules/", json={
        "doctor_id": new_doc_id,
        "day_of_week": 0, # Monday
        "start_time": "09:00:00",
        "end_time": "13:00:00",
        "slot_duration_minutes": 30,
        "is_available": True
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert sched_res.status_code == 201, f"Schedule creation failed: {sched_res.text}"
    sched_id = sched_res.json()["schedule_id"]
    print("B3. Doctor schedule created: id =", sched_id, "day = Monday 09:00 - 13:00")

    # B4. Schedule validation
    bad_sched = client.post("/doctor-schedules/", json={
        "doctor_id": new_doc_id,
        "day_of_week": 0,
        "start_time": "14:00:00",
        "end_time": "10:00:00",
        "slot_duration_minutes": 30
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert bad_sched.status_code in [400, 422]
    print("B4a. Invalid schedule timing rejected")

    overlap_sched = client.post("/doctor-schedules/", json={
        "doctor_id": new_doc_id,
        "day_of_week": 0,
        "start_time": "11:00:00",
        "end_time": "14:00:00",
        "slot_duration_minutes": 30
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert overlap_sched.status_code == 409
    print("B4b. Overlapping schedule correctly rejected with 409 Conflict")

    # B5. Appointment booking
    appt_res = client.post("/appointments/", json={
        "doctor_id": new_doc_id,
        "appointment_date": str(next_monday),
        "start_time": "09:30:00",
        "end_time": "10:00:00",
        "reason_for_visit": "Knee examination",
        "booking_source": "web"
    }, headers={"Authorization": f"Bearer {new_p_token}"})
    assert appt_res.status_code == 201, f"Appointment booking failed: {appt_res.text}"
    appt_id = appt_res.json()["appointment_id"]
    print("B5. Appointment booked successfully: id =", appt_id)

    # Verify automated notification
    notifs = client.get("/notifications/my", headers={"Authorization": f"Bearer {new_p_token}"}).json()
    assert len(notifs) >= 1
    assert "Dr. Integration Doctor" in notifs[0]["message"]
    print("B5b. Automated notification verified:", notifs[0]["message"])

    # B6. Duplicate appointment prevention
    dup_appt = client.post("/appointments/", json={
        "doctor_id": new_doc_id,
        "appointment_date": str(next_monday),
        "start_time": "09:30:00",
        "end_time": "10:00:00",
        "reason_for_visit": "Another checkup",
        "booking_source": "web"
    }, headers={"Authorization": f"Bearer {patient_token}"})
    assert dup_appt.status_code == 409
    print("B6. Double booking prevention verified with 409 Conflict!")

    # B7. Appointment rescheduling
    resched_res = client.patch(f"/appointments/{appt_id}/reschedule", json={
        "appointment_date": str(next_monday),
        "start_time": "10:30:00",
        "end_time": "11:00:00"
    }, headers={"Authorization": f"Bearer {new_p_token}"})
    assert resched_res.status_code == 200
    assert resched_res.json()["start_time"] == "10:30:00"
    print("B7. Appointment rescheduled successfully to 10:30")

    # B8. Appointment cancellation
    cancel_res = client.patch(f"/appointments/{appt_id}/cancel", headers={"Authorization": f"Bearer {new_p_token}"})
    assert cancel_res.status_code == 200
    assert cancel_res.json()["appointment_status"] == "cancelled"
    print("B8. Appointment cancelled successfully")

    # B9. Notification status update
    notif_id = notifs[0]["notification_id"]
    notif_update = client.patch(f"/notifications/{notif_id}/status", json={"delivery_status": "sent"}, headers={"Authorization": f"Bearer {admin_token}"})
    assert notif_update.status_code == 200
    assert notif_update.json()["delivery_status"] == "sent"
    print("B9. Notification status updated to sent: sent_at =", notif_update.json()["sent_at"])

    # B10. Voice call log creation and updating
    call_res = client.post("/voice-calls/", json={
        "phone_number": "9898001122",
        "call_language": "en",
        "call_status": "in-progress",
        "patient_id": new_pat_id,
        "appointment_id": appt_id
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert call_res.status_code == 201
    call_id = call_res.json()["call_id"]
    print("B10. Voice call logged: id =", call_id)

    call_update = client.patch(f"/voice-calls/{call_id}", json={
        "call_status": "completed",
        "ended_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert call_update.status_code == 200
    print("B10b. Voice call updated to completed")

    # B11. Transcript storage and retrieval permissions
    t1 = client.post(f"/voice-calls/{call_id}/transcripts", json={
        "speaker": "patient",
        "message": "Hello, I want to book an appointment with orthopedics.",
        "language": "en"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert t1.status_code == 201

    t2 = client.post(f"/voice-calls/{call_id}/transcripts", json={
        "speaker": "ai_agent",
        "message": "Sure! Dr. Integration Doctor has slots available on Monday.",
        "language": "en"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert t2.status_code == 201
    print("B11a. Transcript messages stored successfully")

    # Patient attempting to access transcripts -> 403
    p_try_t = client.get(f"/voice-calls/{call_id}/transcripts", headers={"Authorization": f"Bearer {new_p_token}"})
    assert p_try_t.status_code == 403
    print("B11b. Patient blocked from reading raw call transcripts (403 Forbidden)")

    # Admin accessing transcripts -> 200
    adm_get_t = client.get(f"/voice-calls/{call_id}/transcripts", headers={"Authorization": f"Bearer {admin_token}"})
    assert adm_get_t.status_code == 200
    assert len(adm_get_t.json()) == 2
    print("B11c. Admin successfully retrieved chronological transcripts, count =", len(adm_get_t.json()))

    # B12. Safe Deactivation of Doctor & Patient
    deact_doc = client.patch(f"/doctors/{new_doc_id}/deactivate", headers={"Authorization": f"Bearer {admin_token}"})
    assert deact_doc.status_code == 200
    assert deact_doc.json()["is_active"] is False
    print("B12a. Doctor safely deactivated via Admin endpoint")

    react_doc = client.patch(f"/doctors/{new_doc_id}/reactivate", headers={"Authorization": f"Bearer {admin_token}"})
    assert react_doc.status_code == 200
    assert react_doc.json()["is_active"] is True
    print("B12b. Doctor safely reactivated via Admin endpoint")

    deact_pat = client.patch(f"/patients/{new_pat_id}/deactivate", headers={"Authorization": f"Bearer {admin_token}"})
    assert deact_pat.status_code == 200
    assert deact_pat.json()["is_active"] is False
    print("B12c. Patient safely deactivated via Admin endpoint")

    print("\n=== ALL AUTHENTICATION AND BACKEND INTEGRATION TESTS PASSED 100%! ===")

    # Clean up test entities created
    db = SessionLocal()
    try:
        db.query(VoiceCallTranscript).filter(VoiceCallTranscript.call_id == call_id).delete()
        db.query(VoiceCallLog).filter(VoiceCallLog.call_id == call_id).delete()
        db.query(Notification).filter(Notification.patient_id == new_pat_id).delete()
        db.query(Appointment).filter(Appointment.appointment_id == appt_id).delete()
        db.query(DoctorSchedule).filter(DoctorSchedule.schedule_id == sched_id).delete()
        db.query(Doctor).filter(Doctor.doctor_id == new_doc_id).delete()
        db.query(Patient).filter(Patient.patient_id == new_pat_id).delete()
        db.commit()
        print("Test entities cleanly cleared. Database remains in pristine state.")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
