export function createHome() {
  const homeContainer = document.createElement("div");
  homeContainer.classList.add("container", "main-container-pop");

  homeContainer.innerHTML = `
    <!-- Bouton de déconnexion -->
    <button id="logoutButton" class="btn btn-danger float-right">Déconnexion</button>

    <div class="home-box">
      <h2>Bienvenue sur la page d'accueil !</h2><br>
      
      <div class="vertical-section" style="display: flex; justify-content: space-between;">
        <!-- Première section verticale -->
        <div id="userProfile" class="user-profile inline-bordered-section">
          <!-- Sous-section 1 : Profil de l'utilisateur -->
        
          <h5 id="userName">Nom:</h5>
          <h5 id="userEmail">Email: </h5>
        </div>
        
        <div id="levelCount" class="level-count inline-bordered-section">
          <!-- Sous-section 2 : Nombre de niveaux -->
          
          <h5 id="userLevel">Level: </h5>
        </div>
        
        <div id="xpCount" class="xp-count inline-bordered-section">
          <!-- Sous-section 3 : Nombre d'XP -->
          <h3>DIV 01</h3>
          <h5 id="userXP"> </h5>
        </div>
      </div>

      <div class="vertical-section" style="display: flex; justify-content: space-between;">
        <!-- Deuxième section verticale -->
        <div id="statistics1" class="statistics-section inline-bordered-section">
          <!-- Section de statistiques avec des graphiques SVG -->
          <h3>Nombre de XP par projet</h3>
          <!-- Graphique SVG 1 -->
          <div id="chart1" class="chart-container">
            <svg class="chart"></svg>
          </div>
        </div>
  
        <div id="statistics2" class="statistics-section inline-bordered-section">
          <!-- Section de statistiques avec des graphiques SVG -->
          <h3>Audits</h3>
          <!-- Graphique SVG 2 -->
          <div id="chart2" class="chart-container">
            <svg class="chart"></svg>
          </div>
        </div>
      </div>
    </div>
  `;

  return homeContainer;
}
