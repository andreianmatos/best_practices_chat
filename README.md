# best_practices_chat

## Overview

Finetuned hugging face's GPT-2 model with webscraped transcripts from youtube playlists best practices chat & bpicd applications and built interactive application with the text generation model live at: 

[modina-eu.github.io/best_practices_chat](https://modina-eu.github.io/best_practices_chat/)

## Project Structure

- **notebooks/**
  - `Best_Practices_Text_Generation.ipynb`: Jupyter Notebook for training Hugging Face's GPT2 with the best practices' text data.
  - **data/**
    - `StyleGAN.ipynb`: Jupyter Notebook for training and generating textures using Style GAN.
  - **generated_texts/**
    - **generated_chats_2/**
      - `generated_*.txt`:  Webscraped text files of the best_practices' youtube playlists.
    - **generated_proposal/**
      - `generated_*.txt`: Text files of the best_practices' proposals.
        
- `index.html`: The main HTML file defining the structure of the web page.
- `sketch.js`: The JavaScript file containing the logic and functionality for the interactive application, calling Hugging Face's API with written prompt and receiving the model's responses.
- `style.css`: Styles the visual appearance of HTML elements.
