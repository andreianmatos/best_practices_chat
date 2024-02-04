let textLines = [];
let userInput = '';
let errorMessage = '';
let isGenerating = false; 

let temperatureSlider;
let maxLengthSlider;

let scrollOffset = 0; 
let horizontalScrollOffset = 0;

const sketch = (p) => {

    let canvas;
    let input;
    let inputDiv;

    p.setup = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
    
        // Create the input div
        inputDiv = document.createElement('div');
        inputDiv.id = 'input-container';
        document.body.appendChild(inputDiv);
    
        // Create the input box inside the input div
        const inputWidth = windowWidth - 100;
        const inputHeight = 30;
        const posX = (windowWidth - inputWidth) / 2;
        const posY = windowHeight - inputHeight - 80; 
        input = p.createInput();
        input.parent('input-container');
        input.position(posX, posY);
        input.size(inputWidth, inputHeight);
        input.changed(handleInput);
    
        // temperature slider
        const sliderWidth = 140;
        const sliderHeight = 20;
        const sliderPosY = windowHeight - inputHeight - 30;
        // from more predictive to more random
        temperatureSlider = p.createSlider(0.01, 1, 0.5, 0.01);
        temperatureSlider.position(windowWidth - inputWidth, sliderPosY);
        temperatureSlider.size(sliderWidth, sliderHeight);
        // size slider
        maxLengthSlider = p.createSlider(10, 300, 30, 10);
        maxLengthSlider.position(inputWidth - sliderWidth, sliderPosY);
        maxLengthSlider.size(sliderWidth, sliderHeight);

        // Create the canvas
        canvas = p.createCanvas(windowWidth - 20, windowHeight - inputHeight - 100); // Adjust canvas height
        canvas.parent('sketch-container');
        canvas.position(10, 10);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(20);        
        p.fill(255);
        
    };
    

    p.draw = () => {
        p.background(0);
    
        for (let i = 0; i < textLines.length; i++) {
            let textData = textLines[i];
            let lines = textData.text.split('\n');
    
            let y = calculateYPosition(i);
    
            if (textData.isError) {
                p.fill(255, 0, 0);
            } else if (textData.isInput) {
                p.fill(255);
            } else {
                p.fill(0, 190, 0);
            }
    
            for (let j = 0; j < lines.length; j++) {
                let x = 20 + scrollOffset; // Apply vertical scroll offset
                x += horizontalScrollOffset; // Apply horizontal scroll offset
    
                canvas.text(lines[j], x, y);
                y += p.textAscent() + p.textDescent();
            }
        }
    };
    
    // Function to calculate the y position based on the index, scrolling offset, and accumulated height
    function calculateYPosition(index) {
        let y = canvas.height - 30; // Start from the bottom of the canvas

        for (let i = textLines.length - 1; i > index; i--) {
            let lines = textLines[i].text.split('\n');
            y -= lines.length * 30;
        }

        const currentLine = textLines[index];
        const lineHeight = p.textAscent() + p.textDescent();
        
        y +=  p.lerp(scrollOffset * lineHeight, (scrollOffset + 1) * lineHeight, 0.1);

        return y;
    }

    async function handleInput() {

        userInput = input.value();
        input.value('');
    
        if (userInput.trim() !== '' && !isGenerating) {   

            textLines.push({ text: userInput + '\n', isInput: true, isError: false }); // User input
 
            isGenerating = true;
            input.value('Generating...'); // Display "Generating..." in the input box
            input.attribute('disabled', 'true'); // Disable user input
            await generateText(userInput);
            isGenerating = false;
            scrollToBottom();
            input.value('');
            input.removeAttribute('disabled');

        }
    }

    // Updated scrollToBottom function
    function scrollToBottom() {
        scrollOffset = 0;
    }

    // Function to handle mouse wheel events for scrolling
    p.mouseWheel = (event) => {
        scrollOffset -= event.delta / 100;
    };
    
    p.mouseDragged = () => {
        horizontalScrollOffset += p.mouseX - p.pmouseX;
    };
    
    
};

new p5(sketch);
async function generateText(promptText) {
    errorMessage = 'Server temporarily unavailable :( Please, try again in a few seconds!';

    const HF_API_TOKEN = "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";
    const model = "blasees/gpt2_bestpractices_chats";

    let result;

    const temperature = temperatureSlider.value();
    const maxLength = maxLengthSlider.value();

    const data = {
        inputs: promptText || " ",
        parameters: {
            temperature: temperature,
            max_length: maxLength
        }
    };

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
            throw new Error();
        }

        result = await response.json(); // Assign value to result

        // Check if result is defined 
        if (result) {
            const generatedText = result[0]["generated_text"];

            // Store the formatted generated text
            textLines.push({ text: generatedText, isInput: false, isError: false }); // Generated text
        } else {
            throw new Error();
        }
    } catch (error) {
        console.error('POST failed. Possible API still loading. If persists, check inference details.');
        textLines.push({ text: errorMessage, isInput: false, isError: true });
    }
}
