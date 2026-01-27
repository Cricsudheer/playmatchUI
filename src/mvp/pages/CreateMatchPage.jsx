/**
 * Create Match Page for MVP
 * Captain flow - create new match with all details
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMvpAuth } from '../hooks/useMvpAuth';
import { useMatchMutations } from '../hooks/useMatch';
import { useAuthAction } from '../hooks/useOtpAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  Input,
  Select,
  NumberInput,
  DateTimeInput,
  Toggle,
  PrimaryButton,
  GhostButton,
  OtpAuthModal,
  ShareLinkModal,
} from '../components';
import {
  EVENT_TYPE_OPTIONS,
  BALL_CATEGORY_OPTIONS,
  BALL_VARIANT_OPTIONS,
  OVERS_MIN,
  OVERS_MAX,
  PENDING_ACTION_TYPES,
} from '../constants';
import { parseGoogleMapsUrl } from '../utils/matchUtils';

export function CreateMatchPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useMvpAuth();
  const { createMatch, loading } = useMatchMutations();
  const { showOtpModal, setShowOtpModal, executeWithAuth } = useAuthAction();
  
  usePageTitle('Create Match');

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdMatch, setCreatedMatch] = useState(null);

  // Form state (matches FRONTEND.md Create Match spec)
  const [formData, setFormData] = useState({
    teamName: '',
    eventType: '',
    ballCategory: '',
    ballVariant: '',
    groundMapsUrl: '',
    overs: '',
    feePerPerson: '',
    emergencyFee: '',
    requiredPlayers: '11',
    backupSlots: '2',
    emergencyEnabled: false,
    startTime: '',
  });

  const [errors, setErrors] = useState({});

  // Parse ground location
  const groundInfo = useMemo(() => {
    return parseGoogleMapsUrl(formData.groundMapsUrl);
  }, [formData.groundMapsUrl]);

  // Get ball variant options based on category
  const ballVariantOptions = useMemo(() => {
    return formData.ballCategory
      ? BALL_VARIANT_OPTIONS[formData.ballCategory] || []
      : [];
  }, [formData.ballCategory]);

  // Get minimum datetime (now + 1 hour)
  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
      // Reset ball variant when category changes
      ...(name === 'ballCategory' ? { ballVariant: '' } : {}),
    }));

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }

    if (!formData.eventType) {
      newErrors.eventType = 'Event type is required';
    }

    if (!formData.ballCategory) {
      newErrors.ballCategory = 'Ball type is required';
    }

    if (!formData.ballVariant) {
      newErrors.ballVariant = 'Ball variant is required';
    }

    if (!formData.groundMapsUrl.trim()) {
      newErrors.groundMapsUrl = 'Ground location is required';
    }

    if (!formData.overs || formData.overs < OVERS_MIN || formData.overs > OVERS_MAX) {
      newErrors.overs = `Overs must be between ${OVERS_MIN} and ${OVERS_MAX}`;
    }

    if (!formData.feePerPerson || formData.feePerPerson < 0) {
      newErrors.feePerPerson = 'Fee per person is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Date and time are required';
    } else if (new Date(formData.startTime) < new Date()) {
      newErrors.startTime = 'Match must be in the future';
    }

    if (formData.emergencyEnabled && (!formData.emergencyFee || formData.emergencyFee < 0)) {
      newErrors.emergencyFee = 'Emergency fee is required when enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Build request body per FRONTEND.md spec
    const matchData = {
      teamName: formData.teamName.trim(),
      eventType: formData.eventType,
      ballCategory: formData.ballCategory,
      ballVariant: formData.ballVariant,
      groundMapsUrl: formData.groundMapsUrl.trim(),
      overs: parseInt(formData.overs, 10),
      feePerPerson: parseFloat(formData.feePerPerson),
      emergencyFee: formData.emergencyEnabled
        ? parseFloat(formData.emergencyFee)
        : null,
      requiredPlayers: parseInt(formData.requiredPlayers, 10),
      backupSlots: parseInt(formData.backupSlots, 10),
      emergencyEnabled: formData.emergencyEnabled,
      startTime: new Date(formData.startTime).toISOString(),
    };

    try {
      const result = await executeWithAuth(
        () => createMatch(matchData),
        PENDING_ACTION_TYPES.CREATE_MATCH,
        { matchData }
      );

      if (result) {
        toast.success('Match created successfully!');
        // Show share modal with actual URLs from API response
        setCreatedMatch({
          matchId: result.matchId,
          teamInviteUrl: result.teamInviteUrl,
          emergencyInviteUrl: result.emergencyInviteUrl,
          teamName: formData.teamName,
          emergencyEnabled: formData.emergencyEnabled,
        });
        setShowShareModal(true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create match');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleNavigateToMatch = () => {
    if (createdMatch?.matchId) {
      navigate(`/matches/${createdMatch.matchId}`);
    }
  };

  return (
    <div className="mvp-page mvp-create-match">
      <header className="mvp-page-header">
        <GhostButton onClick={handleCancel}>← Back</GhostButton>
        <h1 className="mvp-page-title">Create Match</h1>
      </header>

      <form onSubmit={handleSubmit} className="mvp-form">
        {/* Team Name */}
        <Input
          label="Team Name"
          name="teamName"
          value={formData.teamName}
          onChange={handleChange}
          placeholder="e.g., Weekend Warriors"
          error={errors.teamName}
          required
        />

        {/* Event Type */}
        <Select
          label="Event Type"
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
          options={EVENT_TYPE_OPTIONS}
          error={errors.eventType}
          required
        />

        {/* Ball Type */}
        <div className="mvp-form-row">
          <Select
            label="Ball Type"
            name="ballCategory"
            value={formData.ballCategory}
            onChange={handleChange}
            options={BALL_CATEGORY_OPTIONS}
            error={errors.ballCategory}
            required
          />
          <Select
            label="Variant"
            name="ballVariant"
            value={formData.ballVariant}
            onChange={handleChange}
            options={ballVariantOptions}
            placeholder={formData.ballCategory ? 'Select...' : 'Select ball first'}
            disabled={!formData.ballCategory}
            error={errors.ballVariant}
            required
          />
        </div>

        {/* Ground URL */}
        <Input
          label="Ground (Google Maps link)"
          name="groundMapsUrl"
          value={formData.groundMapsUrl}
          onChange={handleChange}
          placeholder="Paste Google Maps link"
          error={errors.groundMapsUrl}
          required
        />
        {groundInfo?.lat && groundInfo?.lng && (
          <div className="mvp-form-hint mvp-form-hint--success">
            ✓ Location detected
          </div>
        )}

        {/* Overs */}
        <NumberInput
          label="Overs"
          name="overs"
          value={formData.overs}
          onChange={handleChange}
          min={OVERS_MIN}
          max={OVERS_MAX}
          placeholder={`${OVERS_MIN}-${OVERS_MAX}`}
          error={errors.overs}
          required
        />

        {/* Fee per person */}
        <NumberInput
          label="Fee per person"
          name="feePerPerson"
          value={formData.feePerPerson}
          onChange={handleChange}
          min={0}
          prefix="₹"
          placeholder="e.g., 200"
          error={errors.feePerPerson}
          required
        />

        {/* Date & Time */}
        <DateTimeInput
          label="Date & Time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          min={minDateTime}
          error={errors.startTime}
          required
        />

        {/* Emergency Players Toggle */}
        <div className="mvp-form-section">
          <Toggle
            label="Enable Emergency Players"
            name="emergencyEnabled"
            checked={formData.emergencyEnabled}
            onChange={handleChange}
          />
          <p className="mvp-form-hint">
            Allow players outside your team to request spots if needed
          </p>
        </div>

        {/* Emergency Fee (conditional) */}
        {formData.emergencyEnabled && (
          <NumberInput
            label="Emergency Player Fee"
            name="emergencyFee"
            value={formData.emergencyFee}
            onChange={handleChange}
            min={0}
            prefix="₹"
            placeholder="e.g., 250"
            error={errors.emergencyFee}
            required
          />
        )}

        {/* Submit Button */}
        <div className="mvp-form-actions">
          <PrimaryButton type="submit" loading={loading}>
            Create & Generate Invite Link
          </PrimaryButton>
        </div>
      </form>

      {/* OTP Modal */}
      <OtpAuthModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={() => {
          setShowOtpModal(false);
          // Re-trigger form submit after auth
          handleSubmit(new Event('submit'));
        }}
        title="Verify to Create Match"
        subtitle="Please verify your phone number to create this match"
      />

      {/* Share Link Modal */}
      <ShareLinkModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        teamInviteUrl={createdMatch?.teamInviteUrl || ''}
        emergencyInviteUrl={createdMatch?.emergencyInviteUrl || ''}
        matchId={createdMatch?.matchId}
        teamName={createdMatch?.teamName || formData.teamName}
        emergencyEnabled={createdMatch?.emergencyEnabled}
        onNavigate={handleNavigateToMatch}
      />
    </div>
  );
}
