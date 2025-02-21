const inputTextarea = document.getElementById('inputTextarea');
const generatedCodeBlock = document.getElementById('generatedCodeBlock');
const hiddenGeneratedCode = document.getElementById('hiddenGeneratedCode');

inputTextarea.addEventListener('input', () => {
    const obfuscatedText = getObfuscatedFunction(inputTextarea.value);
    // Update both the visible code block and hidden textarea
    generatedCodeBlock.textContent = obfuscatedText;
    hiddenGeneratedCode.value = obfuscatedText;
    // Refresh syntax highlighting
    hljs.highlightElement(generatedCodeBlock);
    // Remove data-highlighted attribute
    generatedCodeBlock.removeAttribute('data-highlighted');
});

function getObfuscatedFunction(text) {
    // Filter out newlines and other whitespace before processing
    const filteredText = text.replace(/[\n\r\t]/g, '');
    const charCodes = filteredText.split('').map(char => char.charCodeAt(0));

    // Remove spaces and special characters from function name
    const functionName = `obfuscated${filteredText.replace(/[^a-zA-Z0-9]/g, '')}`;
    let result = `export function ${functionName}(): string {\n    return deobfuscate([\n`;

    charCodes.forEach((code, index) => {
        const isEven = code % 2 === 0;
        let operation;

        // Always do double layer for first character, 30% chance for others
        const doDoubleLayer = index === 0 || Math.random() > 0.7;

        if (isEven) {
            // For even numbers, use divide or multiply
            if (Math.random() > 0.5) {
                // Verify: multiply(x) = x*2 should equal code
                operation = `multiply(${code / 2})`;
                if (doDoubleLayer) {
                    // Verify: multiply(multiply(x)) = x*2*2 should equal code
                    operation = `multiply(multiply(${code / 4}))`;
                }
            } else {
                // Verify: divide(x) = x/2 should equal code
                operation = `divide(${code * 2})`;
                if (doDoubleLayer) {
                    // Verify: divide(divide(x)) = x/2/2 should equal code
                    operation = `divide(divide(${code * 4}))`;
                }
            }

            // Randomly add shift
            if (Math.random() > 0.7) {
                // Verify: shift(x) = x-1 should equal code
                operation = `shift(${code + 1})`;
                if (doDoubleLayer) {
                    // Verify: shift(shift(x)) = (x-1)-1 should equal code
                    operation = `shift(shift(${code + 2}))`;
                }
            }
        } else {
            // For odd numbers, use shift or multiply or both
            if (Math.random() > 0.5) {
                // Verify: shift(x) = x-1 should equal code
                operation = `shift(${code + 1})`;
                if (doDoubleLayer) {
                    // Verify: shift(shift(x)) = (x-1)-1 should equal code
                    operation = `shift(shift(${code + 2}))`;
                }
            } else if (Math.random() > 0.5) {
                // Verify: multiply(x) = x*2 should equal code
                operation = `multiply(${code / 2})`;
                if (doDoubleLayer) {
                    // Verify: multiply(multiply(x)) = x*2*2 should equal code
                    operation = `multiply(multiply(${code / 4}))`;
                }
            } else {
                // For multiply(shift(x)) to equal code:
                // multiply(shift(x)) = (x-1)*2 = code
                // x = (code/2)+1
                operation = `multiply(shift(${code / 2 + 1}))`;
                if (doDoubleLayer) {
                    // For multiply(multiply(shift(x))) to equal code:
                    // multiply(multiply(shift(x))) = ((x-1)*2)*2 = code
                    // x = (code/4)+1
                    operation = `multiply(multiply(shift(${code / 4 + 1})))`;
                }
            }
        }

        // Verify the operation will produce the correct code
        result += `        ${operation}, // ${code} ('${filteredText[index]}')\n`;
    });

    result += '    ]);\n}';
    return result;
}