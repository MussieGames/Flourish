function buildConfirmationEmail(normalizedEmail, templateId) {
  return {
    to: normalizedEmail,
    message: {},
    sendGrid: {
      templateId,
      dynamicTemplateData: {
        email: normalizedEmail,
      },
    },
  };
}

module.exports = {
  buildConfirmationEmail,
};
