let textLines = [];
let userInput = '';
let errorMessage = '';

let temperatureSlider;
let maxLengthSlider;

const sketch = (p) => {
    let canvas;
    let input;

    p.setup = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        canvas = p.createCanvas(windowWidth, windowHeight);
        canvas.parent('sketch-container');
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(25);

        // Create the input box inside the canvas
        const inputWidth = 300;
        const inputHeight = 40;
        const posX = (windowWidth - inputWidth) / 2;
        const posY = (windowHeight - inputHeight) / 2;
        input = p.createInput();
        input.position(posX, posY);
        input.size(inputWidth, inputHeight);
        input.changed(handleInput); // Trigger the function on pressing Enter

        // temperature slider
        const sliderWidth = 150;
        const sliderHeight = 20;
        const sliderPosX = (windowWidth - sliderWidth) / 2;
        const sliderPosY = (windowHeight + inputHeight) / 2 + 20;
        // from more predictive to more random
        temperatureSlider = p.createSlider(0.01, 1, 0.5, 0.01); 
        temperatureSlider.position(sliderPosX, sliderPosY);
        temperatureSlider.size(sliderWidth, sliderHeight);
         // size slider
         maxLengthSlider = p.createSlider(10, 300, 30, 10); 
         maxLengthSlider.position(sliderPosX, sliderPosY+20);
         maxLengthSlider.size(sliderWidth, sliderHeight+20);
    };

    p.draw = () => {
        p.background(30);     
        
        // Display error message on the screen
        p.fill(255, 0, 0);
        p.text(errorMessage, 20, p.height - 50);

        for (let i = 0; i < textLines.length; i++) {
            let textData = textLines[i];

            let lines = textData.text.split('\n');

            // Move the text upwards for each line
            textData.textY -= 1;

            let y = p.height + textData.textY;

            // Change color for generated text
            if (textData.isInput) {
                p.fill(255);
            } else {
                p.fill(p.color(0, p.random(190,220), 0)); 
            }

            // Draw each line of text within window boundaries
            for (let j = 0; j < lines.length; j++) {
                if (y > 0 && y < p.height) {
                    // Justify and draw text only if it is within the window height
                    p.text(lines[j], 20, y, p.width - 40, p.height);
                }
                y += 30; // line spacing
            }

            // Remove the text if it goes off-screen
            if (textData.textY < -lines.length * 30 - p.height) {
                textLines.splice(i, 1);
            }
        }
    };

    // Added prompt for generation...
    function handleInput() {
        userInput = input.value();
        input.value('');

        if (userInput.trim() !== '') {
            textLines.push({ text: userInput, textY: 0, isInput: true });
            generateText(userInput);
        }
    }
};

new p5(sketch);

async function generateText(promptText) {

    console.log(promptText);
    errorMessage = ''; 

    try {
        const HF_API_TOKEN = "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";
        const model = "blasees/gpt2_bestpractices";

        const temperature = temperatureSlider.value();
        const maxLength = maxLengthSlider.value();

        const data = {
            inputs: promptText || " ",
            parameters: {
                temperature: temperature,
                max_length: maxLength
            }
        };

        let result; // Declare result outside the try block

        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${model}`,
                {
                    headers: { "Authorization": `Bearer ${HF_API_TOKEN}` },
                    method: "POST",
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                throw new Error(`Server temporarily unavailable :( Please, try again in a few seconds!`);
            }

            result = await response.json(); // Assign value to result

            // Process the result as needed

            // Check if result is defined before using it
            if (result) {
                const generatedText = result[0]["generated_text"];
                // Remove the promptText from the beginning of the generated text if it exists
                const formattedText = generatedText.startsWith(promptText) ? generatedText.substring(promptText.length) : generatedText;

                // Store the formatted generated text and its scroll position separately for each line
                let lines = formattedText.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    textLines.push({ text: lines[i], textY: 0, isInput: false });
                }
            } else {
                // Handle the case where result is not defined
                console.error("No result available.");
            }
        } catch (error) {
            // Handle errors here
            errorMessage = `Error while generating text for prompt "${promptText}": ${error.message}`;
            console.error(errorMessage);
            textLines.push({ text: errorMessage, textY: 0, isInput: false, isError: true }); // Display error in the text stream with isError flag
        }
    } catch (error) {
        errorMessage = `Error: ${error}`;
        console.error(errorMessage);
        textLines.push({ text: errorMessage, textY: 0, isInput: false, isError: true }); // Display error in the text stream with isError flag
    }
}
