const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    terms: {
        type: Boolean,
        required: true
    },
    selectedGoals: {
        type: [String], 
        default: []   
    }
});

// Hash password before saving to the database
userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) return next();
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
