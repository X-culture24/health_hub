import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { virtualPharmacist, clients } from '../../services/api';
import toast from 'react-hot-toast';

const VirtualPharmacist = () => {
  const [consultationResult, setConsultationResult] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      patient_id: '',
      symptoms: '',
      current_medications: '',
      allergies: '',
      medical_conditions: '',
    }
  });

  const { data: patients } = useQuery('clients', clients.list);

  const consultMutation = useMutation(virtualPharmacist.consult, {
    onSuccess: (data) => {
      setConsultationResult(data);
      toast.success('Virtual pharmacist consultation completed');
    },
    onError: (error) => {
      toast.error('Failed to get consultation');
      console.error('Consultation error:', error);
    }
  });

  const interactionMutation = useMutation(virtualPharmacist.checkInteractions, {
    onSuccess: (data) => {
      toast.success('Drug interaction check completed');
    },
    onError: (error) => {
      toast.error('Failed to check drug interactions');
      console.error('Interaction check error:', error);
    }
  });

  const onSubmit = (data) => {
    consultMutation.mutate(data);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <PsychologyIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" component="h1">
          AI Virtual Pharmacist
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Consultation Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Patient Consultation
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="patient_id"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Select Patient"
                        fullWidth
                        SelectProps={{ native: true }}
                      >
                        <option value="">Select a patient...</option>
                        {patients?.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name} - {patient.phone_number}
                          </option>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="symptoms"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Current Symptoms"
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Describe the patient's current symptoms..."
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="current_medications"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Current Medications"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="List current medications (one per line)..."
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="allergies"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Known Allergies"
                        fullWidth
                        placeholder="List any known drug allergies..."
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="medical_conditions"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Medical Conditions"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="List relevant medical conditions..."
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      onClick={() => reset()}
                      disabled={consultMutation.isLoading}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={consultMutation.isLoading}
                      startIcon={consultMutation.isLoading ? <CircularProgress size={20} /> : <PsychologyIcon />}
                    >
                      {consultMutation.isLoading ? 'Consulting...' : 'Get AI Consultation'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Consultation Results */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              AI Consultation Results
            </Typography>

            {consultMutation.isLoading && (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>
                  AI is analyzing the patient information...
                </Typography>
              </Box>
            )}

            {consultationResult && (
              <Box>
                {/* Drug Recommendations */}
                {consultationResult.recommendations && (
                  <Box mb={3}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Recommended Medications
                    </Typography>
                    <List dense>
                      {consultationResult.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={rec.drug_name}
                            secondary={`${rec.dosage} - ${rec.instructions}`}
                          />
                          <Chip
                            label={rec.priority || 'Standard'}
                            color={getSeverityColor(rec.priority)}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Drug Interactions */}
                {consultationResult.interactions && consultationResult.interactions.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="warning.main">
                      ⚠️ Drug Interaction Warnings
                    </Typography>
                    {consultationResult.interactions.map((interaction, index) => (
                      <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{interaction.drug1}</strong> + <strong>{interaction.drug2}</strong>
                        </Typography>
                        <Typography variant="body2">
                          {interaction.description}
                        </Typography>
                        <Chip
                          label={`Severity: ${interaction.severity}`}
                          color={getSeverityColor(interaction.severity)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Alert>
                    ))}
                  </Box>
                )}

                {/* Additional Notes */}
                {consultationResult.notes && (
                  <Box mb={3}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Additional Notes
                    </Typography>
                    <Alert severity="info">
                      {consultationResult.notes}
                    </Alert>
                  </Box>
                )}

                {/* Contraindications */}
                {consultationResult.contraindications && consultationResult.contraindications.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="error.main">
                      ⚠️ Contraindications
                    </Typography>
                    {consultationResult.contraindications.map((contra, index) => (
                      <Alert key={index} severity="error" sx={{ mb: 1 }}>
                        {contra}
                      </Alert>
                    ))}
                  </Box>
                )}

                {/* Follow-up Recommendations */}
                {consultationResult.follow_up && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Follow-up Recommendations
                    </Typography>
                    <Alert severity="info">
                      {consultationResult.follow_up}
                    </Alert>
                  </Box>
                )}
              </Box>
            )}

            {!consultationResult && !consultMutation.isLoading && (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography color="text.secondary">
                  Fill out the consultation form to get AI-powered medication recommendations
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Disclaimer */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Disclaimer:</strong> This AI virtual pharmacist is a support tool and should not replace professional medical judgment. 
          Always verify recommendations with qualified healthcare professionals before prescribing or dispensing medications.
        </Typography>
      </Alert>
    </Box>
  );
};

export default VirtualPharmacist;
