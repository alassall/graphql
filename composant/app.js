import { createLogin } from './login.js';
import { loadUserProfile,loadXP,loadLevel,loadXPAndDisplayChart ,loadSkills} from './requetes.js';
import { createHome } from './home.js';

document.addEventListener('DOMContentLoaded', () => {
  loadPage();
  
  loadUserProfile();  // Met à jour le profil utilisateur
  loadXP();  // Met à jour les informations XP
  loadLevel();  // Met à jour les informations de niveau
  loadXPAndDisplayChart()
  loadSkills()

});

function loadLogin() {
  const appContainer = document.getElementById('app');
  const loginElement = createLogin();
  appContainer.appendChild(loginElement);

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', authenticateUser);
  } else {
    console.error('Le formulaire avec l\'ID "loginForm" n\'a pas été trouvé.');
  }
}

function getCredentialsFromForm() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  return { username, password };
}

async function getJWT() {
  const signInEndpoint = 'https://learn.zone01dakar.sn/api/auth/signin';
  const credentials = getCredentialsFromForm();
  const base64Credentials = btoa(`${credentials.username}:${credentials.password}`);
  const requestOptions = {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${base64Credentials}`,
      'Content-type': 'application/json',
    },
  };

  try {
    const response = await fetch(signInEndpoint, requestOptions);
    if (!response.ok) {
      throw new Error('Erreur lors de la demande de JWT');
    }

    const jsonResponse = await response.json();

    if (!jsonResponse) {
      throw new Error('Le jeton (token) est manquant dans la réponse JSON');
    }

    return jsonResponse;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function authenticateUser(event) {
  event.preventDefault();
  try {
    const jwt = await getJWT();
    console.log('JWT obtenu avec succès:', jwt);

    localStorage.setItem('jwt', jwt);
    loadPage();  // Appel initial
    location.reload();
  } catch (error) {
    console.error('Erreur lors de l\'obtention du JWT:', error.message);

    const loginErrorElement = document.getElementById('id-login-error');
    if (loginErrorElement) {
      loginErrorElement.textContent = `Erreur : ${error.message}`;
      loginErrorElement.style.color = 'red';
      loginErrorElement.style.display = 'block';
    }
  }
}

function loadPage() {
  const appContainer = document.getElementById('app');

  const jwt = localStorage.getItem('jwt');

  if (jwt) {
    const homeElement = createHome();
    appContainer.innerHTML = '';
    appContainer.appendChild(homeElement);

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', logoutUser);
    } else {
      console.error('Le bouton de déconnexion avec l\'ID "logoutButton" n\'a pas été trouvé.');
    }
  } else {
    loadLogin();
  }

}



export function logoutUser() {
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = '';
  loadLogin();
  localStorage.removeItem('jwt');
}
