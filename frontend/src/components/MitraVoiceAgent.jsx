import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2, ShieldAlert, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

const SCRIPT_ID = 'elevenlabs-convai-widget-script';
const SCRIPT_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

/**
 * MitraVoiceAgent - Official ElevenLabs Conversational AI Hospital Receptionist
 *
 * @param {Object} props
 * @param {string} [props.agentId] - ElevenLabs Conversational AI Agent ID
 * @param {'card' | 'compact' | 'banner'} [props.variant='card'] - Display layout
 * @param {string} [props.className] - Additional CSS classes
 */
export const MitraVoiceAgent = ({
  agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'YOUR_AGENT_ID',
  variant = 'card',
  className = '',
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [micPermission, setMicPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [errorMessage, setErrorMessage] = useState(null);
  const widgetRef = useRef(null);
  const streamRef = useRef(null);

  // 1. Load the official ElevenLabs Conversational AI embed script once
  useEffect(() => {
    let scriptElement = document.getElementById(SCRIPT_ID);

    const onScriptLoad = () => {
      setIsScriptLoaded(true);
    };

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = SCRIPT_ID;
      scriptElement.src = SCRIPT_SRC;
      scriptElement.async = true;
      scriptElement.type = 'text/javascript';
      scriptElement.addEventListener('load', onScriptLoad);
      scriptElement.addEventListener('error', () => {
        setErrorMessage('Failed to load ElevenLabs Conversational AI service. Please check your internet connection.');
      });
      document.body.appendChild(scriptElement);
    } else {
      setIsScriptLoaded(true);
    }

    return () => {
      if (scriptElement) {
        scriptElement.removeEventListener('load', onScriptLoad);
      }
    };
  }, []);

  // 2. Attach lifecycle listeners to the custom <elevenlabs-convai> element
  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    const handleCallStart = () => {
      setIsConnecting(false);
      setIsCalling(true);
      setErrorMessage(null);
    };

    const handleCallEnd = () => {
      setIsConnecting(false);
      setIsCalling(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    const handleCallConfig = (event) => {
      setIsConnecting(false);
      setIsCalling(true);
    };

    // Elevenlabs widget custom events
    widget.addEventListener('conversationStarted', handleCallStart);
    widget.addEventListener('conversationEnded', handleCallEnd);
    widget.addEventListener('elevenlabs-convai:call', handleCallConfig);

    return () => {
      widget.removeEventListener('conversationStarted', handleCallStart);
      widget.removeEventListener('conversationEnded', handleCallEnd);
      widget.removeEventListener('elevenlabs-convai:call', handleCallConfig);
    };
  }, [isScriptLoaded]);

  // 3. Request and verify microphone access
  const requestMicrophoneAccess = async () => {
    try {
      setErrorMessage(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio capture. Please use a modern browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission('granted');
      return true;
    } catch (err) {
      console.warn('Microphone permission check:', err);
      setMicPermission('denied');

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser address bar to speak with Mitra.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No microphone device found. Please connect a working microphone or headset.');
      } else {
        setErrorMessage('Unable to access microphone: ' + (err.message || 'Permission failed'));
      }
      return false;
    }
  };

  // 4. Start Conversation handler
  const handleStartConversation = async () => {
    setErrorMessage(null);
    setIsConnecting(true);

    const hasMic = await requestMicrophoneAccess();
    if (!hasMic) {
      setIsConnecting(false);
      return;
    }

    try {
      const widget = widgetRef.current;
      if (widget && typeof widget.startConversation === 'function') {
        await widget.startConversation();
      } else {
        // If web component method is still binding, fallback to triggering widget click
        const innerBtn = widget?.shadowRoot?.querySelector('button') || widget?.querySelector('button');
        if (innerBtn) {
          innerBtn.click();
        } else {
          setIsConnecting(false);
          setIsCalling(true);
        }
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setIsConnecting(false);
      setErrorMessage('Could not connect to Mitra AI. Please verify your ElevenLabs Agent ID.');
    }
  };

  // 5. End Conversation handler
  const handleEndConversation = async () => {
    try {
      const widget = widgetRef.current;
      if (widget && typeof widget.endConversation === 'function') {
        await widget.endConversation();
      } else {
        const innerBtn = widget?.shadowRoot?.querySelector('button') || widget?.querySelector('button');
        if (innerBtn) innerBtn.click();
      }
    } catch (err) {
      console.warn('End conversation notice:', err);
    } finally {
      setIsCalling(false);
      setIsConnecting(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-xs ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                isCalling
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              <Mic className="w-5 h-5" />
            </div>
            {isCalling && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">
                Mitra – AI Hospital Receptionist
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Voice AI
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Available 24/7 • Speaks English & Tamil • Doctor Guidance & Booking Help
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isCalling ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Call Connected
            </span>
          ) : isConnecting ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Connecting...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Ready to Talk
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Microphone / Connection Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={requestMicrophoneAccess}
            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-medium shrink-0"
          >
            Retry Mic
          </button>
        </div>
      )}

      {/* Interaction Body */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2 space-y-2">
          <p className="text-xs text-gray-700">
            {isCalling ? (
              <span className="font-medium text-blue-900">
                You are currently in a voice call with Mitra. Speak naturally into your microphone to inquire about doctors, schedules, or hospital departments.
              </span>
            ) : (
              <span>
                Tap the button below to start a live voice conversation with our AI receptionist. You can ask:
              </span>
            )}
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-gray-50 text-gray-700 border border-gray-200">
              "Which cardiologist is available this Friday?"
            </span>
            <span className="px-2.5 py-1 rounded bg-gray-50 text-gray-700 border border-gray-200">
              "What is the consultation fee for neurology?"
            </span>
            <span className="px-2.5 py-1 rounded bg-gray-50 text-gray-700 border border-gray-200">
              "Help me book an appointment"
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-end">
          {!isCalling ? (
            <button
              onClick={handleStartConversation}
              disabled={isConnecting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting to Mitra...
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  Start Voice Call with Mitra
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleEndConversation}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              End Voice Conversation
            </button>
          )}

          <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-gray-400" />
            Mic audio processed securely via ElevenLabs AI
          </div>
        </div>
      </div>

      {/* Official ElevenLabs Custom Element container */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span className="text-[11px]">
          Agent ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">{agentId}</code>
        </span>

        {/* Embedded ElevenLabs Widget */}
        <div className="elevenlabs-widget-anchor">
          <elevenlabs-convai
            ref={widgetRef}
            agent-id={agentId}
            action-text="Talk to Mitra"
            start-call-text="Start Call"
            end-call-text="End Call"
            avatar-orb-color-1="#2563eb"
            avatar-orb-color-2="#1d4ed8"
          ></elevenlabs-convai>
        </div>
      </div>
    </div>
  );
};

export default MitraVoiceAgent;

