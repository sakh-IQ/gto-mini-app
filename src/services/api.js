export const sendRegistration = async (data) => {
  try {
    // Здесь будет ваш эндпоинт для отправки данных
    const response = await fetch('YOUR_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending registration:', error);
    throw error;
  }
};