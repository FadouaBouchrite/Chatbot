import responseObj from './responses.js';
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message;
let historique=[];
const API_KEY = "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"; // Paste your API key here
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat");

    let chatContent = className === "outgoing" ? `<p></p>&nbsp;<span style="    background-color: #ccc;
    color: black;
    border-radius: 20%;
    padding-top: 10px;height:48px">you</span>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;

    chatLi.innerHTML = chatContent;

    if (className === "date") {
        // Apply specific styles for the date message
        chatLi.classList.add("date");
        chatLi.style.background = "#fff"; // Fond blanc
        chatLi.style.color = "#000"; // Texte noir
        chatLi.style.textAlign = "center"; // Centre le texte
    } else {
        // Si ce n'est pas un message de date, ajoutez la classe "outgoing" ou "incoming"
        chatLi.classList.add(className);
    }

    chatLi.querySelector("p").textContent = message;

    return chatLi; // Return chat <li> element
};




const generateResponse = (chatElement) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");
    const responseAudio = document.getElementById("responseAudio");

    // Define the properties and message for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: userMessage}],
        })
    }

    // Send POST request to API, get response and set the response as paragraph text
// ...

// Envoyer la requête POST à l'API, obtenir la réponse et définir la réponse comme texte du paragraphe
fetch(API_URL, requestOptions)
    .then(res => res.json())
    .then(data => {
        const responseText = data.choices[0].message.content.trim();
        const premieresDeuxPhrases = responseText.split('.').slice(0, 2).join('.');
        messageElement.textContent = premieresDeuxPhrases;

        // Utiliser l'API Web Speech pour prononcer la réponse
        const syntheseVocale = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(premieresDeuxPhrases); // Utiliser le texte raccourci
       
        syntheseVocale.speak(utterance);

        // Définir la source audio pour la lecture
        responseAudio.src = `data:audio/wav;base64,${data.choices[0].message.audio}`;
        responseAudio.play();
    })
    .catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "Oups ! Quelque chose s'est mal passé. Veuillez réessayer.";
    })
    .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));

}













const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if (!userMessage) return;

    
    const historyElement = document.getElementById("history");
    const textAreaElement = document.getElementById("textArea");

    // Ajouter le message de l'utilisateur à l'historique seulement s'il n'est pas nul
    historique.push(userMessage);

    // Effacer le contenu actuel de l'élément history
    historyElement.innerHTML = "";

    // Parcourir l'historique et ajouter chaque message à l'élément history
    historique.forEach(message => {
        const spanElement = document.createElement("div");
        spanElement.textContent = message;

        // Ajouter un gestionnaire d'événements "click" à chaque élément de l'historique
        spanElement.addEventListener("click", () => {
            // Ajouter le contenu du message au textarea
            textAreaElement.value += message + '\n';
            console.log(message);

        });

        historyElement.appendChild(spanElement);
    });

    console.log(userMessage);
    console.log(historique);
 

    // Clear the input textarea and set its height to default
   

    // Get the current date and time
    const dateActuelle = new Date();
    const heures = dateActuelle.getHours();
    const minutes = dateActuelle.getMinutes();
    
    // Formattez l'heure comme vous le souhaitez (ici, format "HH:mm")
    const heureFormatee = `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Ajoutez la date et l'heure dans le chatbox
    function createElement(message) {

        const element = document.createElement("div");

        element.textContent = message;
        element.style.marginTop="30px"
        element.style.backgroundColor = "#fff"; // Fond blanc
        element.style.color = "#000"; // Texte noir
        element.style.textAlign = "center"; // Centre le texte
        return element;
    }
    
    const dateMessage = `${heureFormatee}`;
    const dateElement = createElement(dateMessage);
    chatbox.appendChild(dateElement);
    
    
    
  

chatInput.value = "";
chatInput.style.height = `${inputInitHeight}px`;

// Append the user's message to the chatbox
chatbox.appendChild(createChatLi(userMessage, "outgoing"));
chatbox.scrollTo(0, chatbox.scrollHeight);
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Vérifiez si la question de l'utilisateur correspond à une question prédéfinie
    const userQuestion = userMessage.toLowerCase();
    if (responseObj.hasOwnProperty(userQuestion)) {
        const response = responseObj[userQuestion];
        const responseLi = createChatLi(response, "incoming");
        chatbox.appendChild(responseLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    } else {
        // Si la question n'a pas de réponse prédéfinie, utilisez l'API pour générer une réponse
        setTimeout(() => {
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);
        }, 600);
         chatInput.addEventListener("input", () => {
     // Adjust the height of the input textarea based on its content
     chatInput.style.height = `${inputInitHeight}px`;
     chatInput.style.height = `${chatInput.scrollHeight}px`;
    
    });
    }
}


chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});
    const mic_btn=document.querySelector('.voice-input');
    const text_area= document.querySelector('.text_area')
     mic_btn.addEventListener('click', function () {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';
  
    recognition.onresult = function (event) {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      text_area.value = transcript;
      console.log(transcript);
    };
  
    recognition.start();

    
  });
  
sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));