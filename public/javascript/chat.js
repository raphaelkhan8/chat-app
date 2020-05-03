const socket = io();

// DOM elements
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormButton = messageForm.querySelector('button');
const locationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');
const sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Get user's Display name and room from login page
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // latest message element
    const newMessage = messages.lastElementChild;
    // height of newMessage
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
    // visible height
    const visibleHeight = messages.offsetHeight;
    // height of messages container
    const contentHeight = messages.scrollHeight;
    // how far has the user scrolled from the top
    const scrollOffset = messages.scrollTop + visibleHeight;

    // check if user was already scrolled to the bottom before newMessage was added
    if (contentHeight - newMessageHeight <= scrollOffset) {
        // if already at the bottom: autoscroll down
        messages.scrollTop = messages.scrollHeight; 
    }
}

socket.on('message', (messageData) => {
    const { text, createdAt, username } = messageData;
    const html = Mustache.render(messageTemplate, {
        message: text,
        username,
        createdAt: moment(createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('locationMessage', location => {
    const { locationUrl, createdAt, username } = location
    const html = Mustache.render(locationTemplate, {
        locationUrl,
        username,
        createdAt: moment(createdAt).format('h:mm a'),
    })
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomUpdate', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users  
    })
    sidebar.innerHTML = html;
})

messageForm.addEventListener('submit', event => {
    event.preventDefault();
    // disable form-submit button while message is being sent to server
    messageFormButton.setAttribute('disabled', 'disabled');

    const message = event.target.elements.message.value;

    // adding callback param to allow for server to check for profanity
    socket.emit('sendMessage', message, (error) => {

        // actions after acknowledgment from server is recieved:
        // re-enable button
        messageFormButton.removeAttribute('disabled');
        // clear input form
        messageFormInput.value = '';
        // place cursor in input form
        messageFormInput.focus();

        (error) ? console.log(error) : console.log('Message posted! :D');
    });
})

locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) { 
        return alert('Geolocation is not supported by your browser :(');
    }

    // disable location button while request is being sent to server
    locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('sendLocation', { latitude, longitude }, () => {
            //re-enable button after location is recieved
            locationButton.removeAttribute('disabled');
            
            console.log('Location shared!');
        }); 
    });
})

socket.emit('joinRoom', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href= '/';
    }
})