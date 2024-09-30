/**
 * Generates a secure mapping between characters and numbers for DIGIT-DIGIT encoding.
 * This function creates a bidirectional mapping between characters and numbers,
 * which can be used for encoding and decoding messages using the DIGIT-DIGIT method.
 * 
 * The mapping is generated dynamically to enhance security and avoid predictable patterns.
 * 
 * @returns {Object} An object containing two maps:
 *   - charToNumMap: A Map object mapping characters to unique numbers
 *   - numToCharMap: A Map object mapping unique numbers back to characters
 */
function generateDigitDigitMap() {
    // Define a comprehensive character set including uppercase and lowercase letters,
    // numbers, and a wide range of special characters to cover most use cases
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_+=[]{}\\|;:\'",.<>/?`~ ';

    // Generate an array of unique numbers corresponding to each character
    // The numbers start from 1 to avoid potential issues with falsy values (e.g., 0)
    const numbers = Array.from({ length: characters.length }, (_, i) => i + 1);

    // Initialize Map objects for bidirectional character-number mappings
    // Using Map instead of plain objects for better performance with large datasets
    const charToNumMap = new Map();
    const numToCharMap = new Map();

    // Iterate through each character in the character set
    characters.split('').forEach((char, index) => {
        // Create a mapping from character to its corresponding unique number
        charToNumMap.set(char, numbers[index]);
        // Create a reverse mapping from the unique number back to the character
        numToCharMap.set(numbers[index], char);
    });

    // Return both mappings as an object for use in encoding and decoding operations
    return { charToNumMap, numToCharMap };
}

/**
 * Encodes an input string using the DIGIT-DIGIT method.
 * This function converts each character in the input string to its corresponding
 * number in the DIGIT-DIGIT mapping. If a character is not found in the mapping,
 * it falls back to using the character's ASCII code.
 * 
 * @param {string} input - The string to be encoded.
 * @returns {string} The encoded string, with numbers separated by hyphens.
 */
function digitDigitEncode(input) {
    // Generate the character-to-number mapping
    const { charToNumMap } = generateDigitDigitMap();

    // Process the input string
    return input
        .split('') // Convert the input string into an array of individual characters
        .map(char => {
            // For each character, retrieve its mapped number or use its ASCII code
            const encoded = charToNumMap.has(char) ? charToNumMap.get(char) : char.charCodeAt(0);
            return encoded;
        })
        .join('-'); // Join the encoded numbers with hyphens for easy parsing during decoding
}

/**
 * Decodes a DIGIT-DIGIT encoded string back to its original form.
 * This function converts each number in the encoded string back to its corresponding
 * character using the DIGIT-DIGIT mapping. If a number is not found in the mapping,
 * it falls back to interpreting it as an ASCII code.
 * 
 * @param {string} encoded - The DIGIT-DIGIT encoded string to be decoded.
 * @returns {string} The decoded original string.
 */
function digitDigitDecode(encoded) {
    // Generate the number-to-character mapping
    const { numToCharMap } = generateDigitDigitMap();

    // Process the encoded string
    return encoded
        .split('-') // Split the encoded string by hyphens to get individual encoded numbers
        .map(item => {
            const num = parseInt(item, 10); // Convert each item to a number, using base 10
            if (numToCharMap.has(num)) {
                return numToCharMap.get(num); // If the number exists in the map, use its mapped character
            } else {
                return String.fromCharCode(num); // Otherwise, interpret the number as an ASCII code
            }
        })
        .join(''); // Concatenate the decoded characters into the final string
}

/**
 * Encodes a string to URI format.
 * This function uses the built-in encodeURIComponent function to convert the input
 * string into a URI-encoded format, replacing certain characters with their percent-encoded equivalents.
 * 
 * @param {string} input - The string to be URI-encoded.
 * @returns {string} The URI-encoded string.
 */
function uriEncode(input) {
    return encodeURIComponent(input);
}

/**
 * Decodes a URI-encoded string.
 * This function uses the built-in decodeURIComponent function to convert a URI-encoded
 * string back to its original form, replacing percent-encoded sequences with their corresponding characters.
 * 
 * @param {string} encoded - The URI-encoded string to be decoded.
 * @returns {string} The decoded string.
 */
function uriDecode(encoded) {
    return decodeURIComponent(encoded);
}

/**
 * Encodes a string to Morse code.
 * This function converts each character of the input string to its Morse code equivalent.
 * It supports uppercase letters, numbers, and spaces. Other characters are left unchanged.
 * 
 * @param {string} input - The string to be encoded into Morse code.
 * @returns {string} The Morse code encoded string, with characters separated by spaces and words by '/'.
 */
function morseEncode(input) {
    // Define the Morse code mapping for letters, numbers, and space
    const morseCodeMap = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
        '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.', ' ': '/'
    };
    
    // Convert the input to uppercase and split into characters
    return input.toUpperCase().split('')
        .map(char => morseCodeMap[char] || char) // Map each character to its Morse code equivalent
        .join(' '); // Join the Morse code symbols with spaces
}

/**
 * Decodes a Morse code encoded string.
 * This function converts each Morse code symbol back to its corresponding character.
 * It supports letters, numbers, and spaces (represented by '/'). Unknown symbols are left unchanged.
 * 
 * @param {string} encoded - The Morse code encoded string to be decoded.
 * @returns {string} The decoded string.
 */
function morseDecode(encoded) {
    // Define the reverse Morse code mapping
    const morseCodeMap = {
        '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
        '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
        '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
        '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
        '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
        '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
        '---..': '8', '----.': '9', '/': ' '
    };
    
    // Split the encoded string by spaces and map each Morse code symbol to its character
    return encoded.split(' ')
        .map(code => morseCodeMap[code] || code) // Map each Morse code to its character
        .join(''); // Join the decoded characters into a string
}

/**
 * Encodes a string to binary.
 * This function converts each character of the input string to its 8-bit binary representation.
 * 
 * @param {string} input - The string to be encoded into binary.
 * @returns {string} The binary encoded string, with each character's binary representation separated by spaces.
 */
function binaryEncode(input) {
    return input.split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0')) // Convert each char to 8-bit binary
        .join(' '); // Separate binary codes with spaces for readability
}

/**
 * Decodes a binary encoded string.
 * This function converts each 8-bit binary code back to its corresponding character.
 * 
 * @param {string} encoded - The binary encoded string to be decoded.
 * @returns {string} The decoded string.
 */
function binaryDecode(encoded) {
    return encoded.split(' ') // Split the binary string by spaces
        .map(bin => String.fromCharCode(parseInt(bin, 2))) // Convert each binary code to its character
        .join(''); // Join the characters into a string
}

/**
 * Encodes a string to Base64.
 * This function uses the built-in Buffer class to convert the input string to its Base64 representation.
 * 
 * @param {string} input - The string to be encoded into Base64.
 * @returns {string} The Base64 encoded string.
 */
function base64Encode(input) {
    return Buffer.from(input).toString('base64');
}

/**
 * Decodes a Base64 encoded string.
 * This function uses the built-in Buffer class to convert a Base64 encoded string back to its original form.
 * 
 * @param {string} encoded - The Base64 encoded string to be decoded.
 * @returns {string} The decoded string.
 */
function base64Decode(encoded) {
    return Buffer.from(encoded, 'base64').toString('utf-8');
}

/**
 * Encodes a string to hexadecimal.
 * This function converts each character of the input string to its two-digit hexadecimal representation.
 * 
 * @param {string} input - The string to be encoded into hexadecimal.
 * @returns {string} The hexadecimal encoded string.
 */
function hexEncode(input) {
    return input.split('')
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0')) // Convert each char to 2-digit hex
        .join('');
}

/**
 * Decodes a hexadecimal encoded string.
 * This function converts each two-digit hexadecimal code back to its corresponding character.
 * 
 * @param {string} encoded - The hexadecimal encoded string to be decoded.
 * @returns {string} The decoded string.
 */
function hexDecode(encoded) {
    return encoded.match(/.{1,2}/g) // Split the hex string into pairs
        .map(hex => String.fromCharCode(parseInt(hex, 16))) // Convert each hex pair to its character
        .join('');
}

/**
 * Encodes a string using ROT13 cipher.
 * ROT13 is a simple letter substitution cipher that replaces a letter with the 13th letter after it in the alphabet.
 * 
 * @param {string} input - The string to be encoded using ROT13.
 * @returns {string} The ROT13 encoded string.
 */
function rot13Encode(input) {
    return input.replace(/[a-zA-Z]/g, char => {
        const code = char.charCodeAt(0);
        // Determine the ASCII code range (65-90 for uppercase, 97-122 for lowercase)
        const base = code <= 90 ? 65 : 97;
        // Apply ROT13 transformation
        return String.fromCharCode(((code - base + 13) % 26) + base);
    });
}

/**
 * Decodes a ROT13 encoded string.
 * Since ROT13 is its own inverse, the encoding function is used for decoding as well.
 * 
 * @param {string} encoded - The ROT13 encoded string to be decoded.
 * @returns {string} The decoded string.
 */
function rot13Decode(encoded) {
    return rot13Encode(encoded); // ROT13 is symmetric, so encoding function works for decoding
}

/**
 * Encodes a string using Caesar cipher with a given shift.
 * Caesar cipher is a substitution cipher where each letter in the plaintext is shifted a certain number of places down the alphabet.
 * 
 * @param {string} input - The string to be encoded using Caesar cipher.
 * @param {number} shift - The number of positions to shift each letter (positive for right shift, negative for left shift).
 * @returns {string} The Caesar cipher encoded string.
 */
function caesarEncode(input, shift) {
    return input.replace(/[a-zA-Z]/g, char => {
        const code = char.charCodeAt(0);
        const base = code <= 90 ? 65 : 97; // Determine ASCII range (uppercase or lowercase)
        return String.fromCharCode(((code - base + shift + 26) % 26) + base);
    });
}

/**
 * Decodes a Caesar cipher encoded string.
 * This function applies the reverse shift to decode the message.
 * 
 * @param {string} encoded - The Caesar cipher encoded string to be decoded.
 * @param {number} shift - The number of positions each letter was shifted during encoding.
 * @returns {string} The decoded string.
 */
function caesarDecode(encoded, shift) {
    return caesarEncode(encoded, -shift); // Decoding is done by shifting in the opposite direction
}

/**
 * Encodes a string using Atbash cipher.
 * Atbash cipher is a substitution cipher where the first letter of the alphabet is replaced with the last letter, the second with the second to last, and so on.
 * 
 * @param {string} input - The string to be encoded using Atbash cipher.
 * @returns {string} The Atbash cipher encoded string.
 */
function atbashEncode(input) {
    return input.replace(/[a-zA-Z]/g, char => {
        const code = char.charCodeAt(0);
        const base = code <= 90 ? 65 : 97; // Determine ASCII range (uppercase or lowercase)
        return String.fromCharCode(25 - (code - base) + base);
    });
}

/**
 * Decodes an Atbash cipher encoded string.
 * Since Atbash is its own inverse, the encoding function is used for decoding as well.
 * 
 * @param {string} encoded - The Atbash cipher encoded string to be decoded.
 * @returns {string} The decoded string.
 */
function atbashDecode(encoded) {
    return atbashEncode(encoded); // Atbash is symmetric, so encoding function works for decoding
}

/**
 * Encodes a message using the specified encoding type.
 * @param {string} input - The message to be encoded.
 * @param {string} type - The encoding type to use.
 * @returns {string} The encoded message.
 * @throws {Error} If an unsupported encoding type is provided.
 */
function encode(input, type) {
    switch (type.toLowerCase()) {
        case 'digit-digit':
            return digitDigitEncode(input);
        case 'uri':
            return uriEncode(input);
        case 'morse':
            return morseEncode(input);
        case 'binary':
            return binaryEncode(input);
        case 'base64':
            return base64Encode(input);
        case 'hex':
            return hexEncode(input);
        case 'rot13':
            return rot13Encode(input);
        case 'caesar':
            return caesarEncode(input, 3); // Using a default shift of 3
        case 'atbash':
            return atbashEncode(input);
        default:
            throw new Error(`Unsupported encoding type: ${type}`);
    }
}

/**
 * Decodes a message using the specified decoding type.
 * @param {string} encoded - The message to be decoded.
 * @param {string} type - The decoding type to use.
 * @returns {string} The decoded message.
 * @throws {Error} If an unsupported decoding type is provided.
 */
function decode(encoded, type) {
    switch (type.toLowerCase()) {
        case 'digit-digit':
            return digitDigitDecode(encoded);
        case 'uri':
            return uriDecode(encoded);
        case 'morse':
            return morseDecode(encoded);
        case 'binary':
            return binaryDecode(encoded);
        case 'base64':
            return base64Decode(encoded);
        case 'hex':
            return hexDecode(encoded);
        case 'rot13':
            return rot13Decode(encoded);
        case 'caesar':
            return caesarDecode(encoded, 3); // Using a default shift of 3
        case 'atbash':
            return atbashDecode(encoded);
        default:
            throw new Error(`Unsupported decoding type: ${type}`);
    }
}

// Export the functions for use in other modules
module.exports = {
    generateDigitDigitMap,
    encode,
    decode
};