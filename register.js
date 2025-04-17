// Import Firebase SDK
import { initializeApp } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX504xemLxE_eckV74-0jnPj4hJvK0DIw",
  authDomain: "my-project-external-fe5f4.firebaseapp.com",
  projectId: "my-project-external-fe5f4",
  storageBucket: "my-project-external-fe5f4.firebasestorage.app",
  messagingSenderId: "565933844021",
  appId: "1:565933844021:web:ddaf34e04ef1797252f37c",
  measurementId: "G-F7S76VLG9S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// DOM Elements
const registerTab = document.getElementById('register-tab');
const loginTab = document.getElementById('login-tab');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const closeNotification = document.querySelector('.close-notification');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
const googleButtons = document.querySelectorAll('.social-btn.google');
const facebookButtons = document.querySelectorAll('.social-btn.facebook');

// Tab functionality
registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
});

// Password visibility toggle
togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
        const passwordField = this.previousElementSibling;
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});

// Show notification function
function showNotification(message, type = 'info') {
    notificationMessage.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Close notification
closeNotification.addEventListener('click', () => {
    notification.classList.remove('show');
});

// Register user
registerBtn.addEventListener('click', async () => {
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const termsCheckbox = document.getElementById('terms-checkbox').checked;
    
    // Validation
    if (!fullname || !email || !password || !confirmPassword) {
        showNotification('Будь ласка, заповніть усі поля', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Паролі не співпадають', 'error');
        return;
    }
    
    if (!termsCheckbox) {
        showNotification('Будь ласка, погодьтеся з умовами користування', 'error');
        return;
    }
    
    try {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Add user info to Firestore
        await setDoc(doc(db, "users", user.uid), {
            fullname: fullname,
            email: email,
            createdAt: new Date().toISOString()
        });
        
        showNotification('Реєстрація успішна! Перенаправлення...', 'success');
        
        // Redirect after successful registration
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
        
    } catch (error) {
        let errorMessage = 'Помилка при реєстрації';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Ця електронна пошта вже використовується';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Некоректна електронна пошта';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Пароль занадто слабкий (мінімум 6 символів)';
        }
        
        showNotification(errorMessage, 'error');
    }
});

// Login user
loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Validation
    if (!email || !password) {
        showNotification('Будь ласка, заповніть усі поля', 'error');
        return;
    }
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        
        showNotification('Вхід успішний! Перенаправлення...', 'success');
        
        // Redirect after successful login
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
        
    } catch (error) {
        let errorMessage = 'Помилка входу';
        
        if (error.code === 'auth/invalid-email') {
            errorMessage = 'Некоректна електронна пошта';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'Цей користувач відключений';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Користувача не знайдено';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Неправильний пароль';
        }
        
        showNotification(errorMessage, 'error');
    }
});

// Google Authentication
googleButtons.forEach(button => {
    button.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // Check if new user
            if (result._tokenResponse.isNewUser) {
                // Add user info to Firestore
                await setDoc(doc(db, "users", result.user.uid), {
                    fullname: result.user.displayName || 'Google User',
                    email: result.user.email,
                    createdAt: new Date().toISOString()
                });
            }
            
            showNotification('Вхід через Google успішний! Перенаправлення...', 'success');
            
            // Redirect after successful login
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 2000);
            
        } catch (error) {
            showNotification('Помилка при вході через Google', 'error');
        }
    });
});

// Facebook Authentication
facebookButtons.forEach(button => {
    button.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            // Check if new user
            if (result._tokenResponse.isNewUser) {
                // Add user info to Firestore
                await setDoc(doc(db, "users", result.user.uid), {
                    fullname: result.user.displayName || 'Facebook User',
                    email: result.user.email,
                    createdAt: new Date().toISOString()
                });
            }
            
            showNotification('Вхід через Facebook успішний! Перенаправлення...', 'success');
            
            // Redirect after successful login
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 2000);
            
        } catch (error) {
            showNotification('Помилка при вході через Facebook', 'error');
        }
    });
});

// Animation on page load
document.addEventListener('DOMContentLoaded', () => {
    registerForm.style.opacity = '0';
    setTimeout(() => {
        registerForm.style.opacity = '1';
    }, 100);
});

// Check authentication status
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in, redirect to dashboard
        window.location.href = '/dashboard.html';
    }
});

// Add pulsing effect to the logo
const logo = document.querySelector('.logo .n');
setInterval(() => {
    logo.style.textShadow = '0 0 10px rgba(52, 152, 219, 0.8)';
    setTimeout(() => {
        logo.style.textShadow = 'none';
    }, 1000);
}, 2000);

// Add ripple effect to buttons
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        const x = e.clientX - e.target.offsetLeft;
        const y = e.clientY - e.target.offsetTop;
        
        const ripple = document.createElement('span');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});
