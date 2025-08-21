// Esta función implementa el Algoritmo de Luhn
export const isValidCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }

  // 1. Limpia el número: quita espacios y guiones
  const cleanedCardNumber = cardNumber.replace(/[\s-]/g, '');

  // 2. Verifica que solo contenga dígitos y tenga una longitud válida (13-19)
  if (!/^\d+$/.test(cleanedCardNumber) || cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
    return false;
  }

  // 3. Implementación del Algoritmo de Luhn
  let sum = 0;
  let shouldDouble = false;

  // Itera sobre los dígitos de derecha a izquierda
  for (let i = cleanedCardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanedCardNumber.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  // 4. Si la suma total es un múltiplo de 10, el número es válido
  return sum % 10 === 0;
};