let users = [];

// add a user
const addUser = ({ id, username, room }) => {
    // Clean data (trim and force to lowercase)
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    // Validate that inputs are not blank
    if (!username || !room) { 
        return { error: 'Username and Room are both required' }
    }
    // Make sure username hasn't been taken
    const existingUser = users.find(user => {
        return user.room === room && user.username === username;
    })
    if (existingUser) {
        return { error: 'Username is in use :('}
    }
    // If all is well, push new user into users array and return their info
    const user = { id, username, room };
    users.push(user);
    return { user }
}

// remove a user
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)
    if (index > -1) {
        return users.splice(index, 1)[0];
    }
}

// get user's info
const getUserInfo = (id) => {
    return users.find(user => user.id === id);
}

// get all user's in a room
const getAllUsersInRoom = (room) => {
    const cleanRoom = room.trim().toLowerCase();
    return users.filter(user => user.room === cleanRoom);
}


module.exports = {
    addUser,
    removeUser,
    getUserInfo,
    getAllUsersInRoom
}
