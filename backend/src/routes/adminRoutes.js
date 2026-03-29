
router.get(
  '/settings/admission-fee',
  protect,
  studentController.getAdmissionFee
);

// Update admission fee (admin only)
router.put(
  '/settings/admission-fee',
  protect,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.updateAdmissionFee
);