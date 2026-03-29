// src/controllers/SettingsController.js (or add this to StudentController)

getAdmissionFee = async (req, res) => {
  try {
    // Get from settings
    let settings = await Settings.findOne({ key: 'admission_fee' });
    
    if (!settings) {
      // Create default if not exists
      settings = await Settings.create({
        key: 'admission_fee',
        value: 5000,
        description: 'One-time admission fee for new students'
      });
    }
    
    return this.success(res, {
      admissionFee: settings.value,
      currency: 'INR',
      description: settings.description
    });
  } catch (error) {
    console.error('Get admission fee error:', error);
    return this.error(res, error.message, 500);
  }
};

// Update admission fee (admin only)
updateAdmissionFee = async (req, res) => {
  try {
    const { fee } = req.body;
    
    if (!fee || fee <= 0) {
      return this.error(res, 'Valid fee amount is required', 400);
    }
    
    let settings = await Settings.findOne({ key: 'admission_fee' });
    
    if (settings) {
      settings.value = fee;
      await settings.save();
    } else {
      settings = await Settings.create({
        key: 'admission_fee',
        value: fee,
        description: 'One-time admission fee for new students'
      });
    }
    
    return this.success(res, {
      admissionFee: settings.value
    }, 'Admission fee updated successfully');
  } catch (error) {
    console.error('Update admission fee error:', error);
    return this.error(res, error.message, 500);
  }
};