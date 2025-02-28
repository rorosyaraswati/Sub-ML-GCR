const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    "id": id,
    "result": label,
    "suggestion": suggestion,
    "createdAt": createdAt
  };

  // Menyertakan penjelasan jika diinginkan
  if (explanation) {
    data.explanation = explanation;
  }

  await storeData(id, data);

  // Mengubah pesan berdasarkan tingkat kepercayaan
  const message = confidenceScore > 99 ? 'Model is predicted successfully.' : 'Model is predicted successfully but under threshold. Please use the correct picture';

  const response = h.response({
    status: 'success',
    message: message,
    data: data
  });
  response.code(201);
  return response;
}

module.exports = postPredictHandler;
