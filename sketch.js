let textLines = [];
let userInput = '';
let errorMessage = '';
let isGenerating = false; 

let temperatureSlider;
let maxLengthSlider;
let topKSlider;
let lengthPenaltySlider;
let noRepeatNGramSlider;

let scrollOffset = 0; 
let horizontalScrollOffset = 0;

let infoDiv;
let infoButton;

const sketch = (p) => {

    let canvas;
    let input;
    let inputDiv;

    p.setup = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
    
        inputDiv = document.createElement('div');
        inputDiv.id = 'input-container';
        document.body.appendChild(inputDiv);

        // info div
        infoDiv = document.createElement('div');
        infoDiv.id = 'info-container';
        infoDiv.style.position = 'absolute';
        infoDiv.style.top = '10px';
        infoDiv.style.left = '10px';
        infoDiv.style.color = 'white';
        infoDiv.style.fontFamily = 'Arial, sans-serif';
        infoDiv.style.display = 'none'
        document.body.appendChild(infoDiv);
        updateInfo();  
        
        infoButton = document.createElement('button');
        infoButton.innerHTML = '<i>ℹ️</i>'; // ℹ️ is the information icon
        infoButton.style.position = 'absolute';
        infoButton.style.top = '10px';
        infoButton.style.right = '10px';
        infoButton.style.backgroundColor = 'transparent';
        infoButton.style.border = 'none';
        infoButton.style.color = 'white';
        infoButton.style.fontSize = '20px';
        infoButton.style.cursor = 'pointer';
        infoButton.addEventListener('click', toggleInfoVisibility);
        document.body.appendChild(infoButton);
    
        // the input text box
        const inputWidth = windowWidth - 100;
        const inputHeight = 30;
        const posX = (windowWidth - inputWidth) / 2;
        const posY = windowHeight - inputHeight - 80; 
        input = p.createInput();
        input.parent('input-container');
        input.position(posX, posY);
        input.size(inputWidth, inputHeight);
        input.changed(handleInput);

        const sliderWidth = 140;
        const sliderHeight = 20;
        const sliderPosY = windowHeight - inputHeight - 40;

        // temperature slider
        temperatureSlider = p.createSlider(0.01, 1, 0.5, 0.01);
        temperatureSlider.position(windowWidth - inputWidth - 30, sliderPosY);
        temperatureSlider.size(sliderWidth, sliderHeight);
        createLabel('temperature', windowWidth - inputWidth - 30, sliderPosY + sliderHeight + 15);

        // max length slider
        maxLengthSlider = p.createSlider(50, 500, 100, 10);
        maxLengthSlider.position(windowWidth - inputWidth + sliderWidth - 10, sliderPosY);
        maxLengthSlider.size(sliderWidth, sliderHeight);
        createLabel('max length', windowWidth - inputWidth + sliderWidth - 10, sliderPosY + sliderHeight + 15);

        // top-k slider
        topKSlider = p.createSlider(1, 100, 50, 1);
        topKSlider.position(windowWidth - inputWidth + 2 * sliderWidth + 10, sliderPosY);
        topKSlider.size(sliderWidth, sliderHeight);
        createLabel('top-k', windowWidth - inputWidth + 2 * sliderWidth + 10, sliderPosY + sliderHeight + 15);

        // length penalty slider
        lengthPenaltySlider = p.createSlider(0.1, 2, 1, 0.1);
        lengthPenaltySlider.position( windowWidth - inputWidth + 3 * sliderWidth + 30, sliderPosY);
        lengthPenaltySlider.size(sliderWidth, sliderHeight);
        createLabel('length penalty',  windowWidth - inputWidth + 3 * sliderWidth + 30, sliderPosY + sliderHeight + 15);

        // noRepeatNGramSlider slider
        noRepeatNGramSlider = p.createSlider(1, 10, 2, 1);
        noRepeatNGramSlider.position(windowWidth - inputWidth + 4 * sliderWidth + 50, sliderPosY);
        noRepeatNGramSlider.size(sliderWidth, sliderHeight);
        createLabel('no repeat n-grams', windowWidth - inputWidth + 4 * sliderWidth + 50, sliderPosY + sliderHeight + 15);

        // canvas
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
                let x = 20 + scrollOffset;
                x += horizontalScrollOffset;
    
                canvas.text(lines[j], x, y);
                y += p.textAscent() + p.textDescent();
            }
        }
    };
    
    // [fix] calculate the y position based on the index, scrolling offset, and accumulated height
    function calculateYPosition(index) {
        let y = canvas.height - 30;
        const lineHeight = p.textAscent() + p.textDescent();
    
        for (let i = textLines.length - 1; i > index; i--) {
            let lines = textLines[i].text.split('\n');
            y -= lines.length * lineHeight;
        }
    
        y +=  p.lerp(scrollOffset * lineHeight, (scrollOffset + 1) * lineHeight, 0.1);
    
        return y;
    }
    

    async function handleInput() {

        userInput = input.value();
        input.value('');
    
        if (userInput.trim() !== '' && !isGenerating) {   

            // display user input
            textLines.push({ text: userInput + '...' + '\n', isInput: true, isError: false });
 
            isGenerating = true;
            input.value('Generating...'); 
            input.attribute('disabled', 'true'); // disable user input
            await generateText(userInput);
            isGenerating = false;
            scrollToBottom();
            input.value('');
            input.removeAttribute('disabled');

        }
    }

    function createLabel(labelText, x, y) {
        const label = document.createElement('label');
        label.innerText = labelText;
        label.style.position = 'absolute';
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        label.style.color = 'white'; 
        label.style.fontFamily = 'Arial, sans-serif'; 
        document.getElementById('sketch-container').appendChild(label);
    }

    function updateInfo() {
        infoDiv.innerHTML = `
            <p><strong>Temperature:</strong> Controls randomness. Higher values (closer to 1) make output more random, lower values (closer to 0) make it more focused.</p>
            <p><strong>Max Length:</strong> Specifies the maximum length of generated text in characters. Stops generation when this length is reached.</p>
            <p><strong>Top-K:</strong> Limits vocabulary to the top-K most probable tokens. Controls diversity of generated text.</p>
            <p><strong>Length Penalty:</strong> Influences text length. Values > 1 encourage longer outputs, < 1 encourage shorter outputs.</p>
            <p><strong>No Repeat N-gram Size:</strong> Applies a penalty for repeating n-grams in the generated text. Prevents the repetition of specific sequences.</p>
        `;
    }
    

    function toggleInfoVisibility() {
        infoDiv.style.display = infoDiv.style.display === 'none' ? 'block' : 'none';
    }
    
    function scrollToBottom() {
        scrollOffset = 0;
    }

    p.mouseWheel = (event) => {
        scrollOffset -= event.delta / 100;
    };
    
    p.mouseDragged = () => {
        if (
            p.mouseX > 10 && 
            p.mouseX < canvas.width - 10 &&
            p.mouseY > 10 && 
            p.mouseY < canvas.height - 10 
        ) {
            horizontalScrollOffset += p.mouseX - p.pmouseX;
        }
    };   
    
};

new p5(sketch);

async function generateText(promptText) {
    errorMessage = 'Server temporarily unavailable :( Please, try again in a few seconds!';

    const HF_API_TOKEN = "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";
    const model = "blasees/gpt2_chats_proposals";

    let result;

    const temperature = temperatureSlider.value();
    const maxLength = maxLengthSlider.value();
    const topK = topKSlider.value();
    const lengthPenalty = lengthPenaltySlider.value();
    const noRepeatNGram = noRepeatNGramSlider.value();
    
    const data = {
        inputs: promptText || " ",
        parameters: {
            temperature: temperature,
            max_length: maxLength,            
            top_k: topK,
            length_penalty: lengthPenalty,
            num_beams: 5, // compare 5 beams
            no_repeat_ngram_size: noRepeatNGram, // n-gram penalty (no 2-ngrams appear twice)
            num_return_sequences: 1, // return just one beam
            early_stopping: true,    
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

        result = await response.json(); 

        if (result) {
            const generatedText = result[0]["generated_text"];

            // Store the generated text without the prompt
            textLines.push({ text: generatedText, isInput: false, isError: false }); // Generated text
        } else {
            throw new Error();
        }
    } catch (error) {
        console.error('POST failed. Possible API still loading. If persists, check inference details.');
        textLines.push({ text: errorMessage, isInput: false, isError: true });
    }
}
