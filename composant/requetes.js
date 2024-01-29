import { logoutUser } from './app.js';
const jwt = localStorage.getItem('jwt');

// Fonction pour charger les informations du profil de l'utilisateur
export async function loadUserProfile() {
    const userProfileElement = document.getElementById('userProfile');

    if (userProfileElement && jwt) {
      try {
        const response = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                user {
                  lastName
                  firstName
                  email
                  attrs
                }
              }
            `,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du profil utilisateur');
        }
  
        const { data } = await response.json();
        const user = data.user[0];
  
        // Mettez à jour les éléments du DOM avec les informations du profil de l'utilisateur
        document.getElementById('userName').textContent += `${user.firstName} ${user.lastName}`;
        document.getElementById('userEmail').textContent += user.email;

        
      } catch (error) {
        logoutUser()
        // console.error('Erreur lors du chargement du profil utilisateur:', error.message);
      }
    }
  }
  
/****************************************************************************************************************************/
export async function loadXP() {
  // Vérifier si le JWT est présent
  if (jwt) {
    try {
      const response = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              xpTotal: transaction_aggregate(
                where: {
                  type: { _eq: "xp" },
                  _and: [
                    { path: { _ilike: "/dakar/div-01%" } },
                    { path: { _nlike: "%/dakar/div-01/piscine-js/%" } },
                    { path: { _nlike: "%/dakar/div-01/piscine-js-2/%" } }
                  ]
                }
              ) {
                aggregate {
                  sum {
                    amount
                  }
                }
              }
            }

          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des XP');
      }

      const { data } = await response.json();
      const totalXpAmount = data.xpTotal.aggregate.sum.amount;

      // Convertir en mégaoctets si la taille est supérieure à 1024 KB
      const totalXpAmountMB = totalXpAmount >= 1000 ? totalXpAmount / 1000 : totalXpAmount;
      const unit = totalXpAmount >= 1000 ? 'KB' : 'MB';

      // Mettre à jour le contenu de la page avec la somme des XP
      const xpCountElement = document.getElementById('userXP');
      if (xpCountElement) {
        xpCountElement.textContent = `${totalXpAmountMB.toFixed(0)} ${unit}`;
      }
    } catch (error) {
    
      // console.error('Erreur lors du chargement des XP :', error.message);
    }
  }
}

/****************************************************************************************************************************/

  // Fonction pour charger les informations du niveau de l'utilisateur
export async function loadLevel() {
    const levelCountElement = document.getElementById('userLevel');
  
    if (jwt) {
      try {
        const response = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                maxLevelTransaction: transaction_aggregate(
                  where: { type: { _eq: "level" }, path: { _ilike: "%/dakar/div-01%" } },
                  order_by: { amount: desc },
                  limit: 1
                ) {
                  nodes {
                    amount
                  }
                }
              }
            `,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du niveau');
        }
  
        const { data } = await response.json();
        const maxLevelAmount = data.maxLevelTransaction.nodes[0]?.amount;
  
        // Mettez à jour le contenu de la page avec le montant du niveau le plus élevé
        if (maxLevelAmount !== undefined) {
          levelCountElement.textContent = `Level: ${maxLevelAmount}`;
        }
      } catch (error) {
        // console.error('Erreur lors du chargement du niveau :', error.message);
      }
    }
  }
  
/****************************************************************************************************************************/

function convertToKB(xpAmount, decimalPlaces = 0) {
  // 1 XP équivaut à 1 byte
  const bytes = xpAmount;

  // Convertir bytes en kilobytes
  const kilobytes = bytes / 1000;

  // Arrondir le résultat au nombre spécifié de décimales
  const roundedKB = kilobytes.toFixed(decimalPlaces);

  // Convertir la chaîne en nombre puis en chaîne pour éliminer les zéros inutiles et le point décimal
  const finalKB = Number(roundedKB).toString();

  return finalKB;
}



// Fonction pour créer un diagramme en barres représentant les XP par projet en utilisant SVG
function barXpProjet(xpTransactions) {
  // Créer un objet pour stocker le total des XP par projet
  const xpByProject = {};

  // Calculer le total des XP par projet
  xpTransactions.forEach(transaction => {
    const pathParts = transaction.path.split('/');
    const projectName = pathParts[pathParts.length - 1];
    xpByProject[projectName] = (xpByProject[projectName] || 0) + transaction.amount;
  });

  // Trier les projets par XP (du plus grand au plus petit)
  const sortedProjects = Object.keys(xpByProject).sort((a, b) => xpByProject[b] - xpByProject[a]);

  // Sélectionner les 10 premiers projets
  const topProjects = sortedProjects.slice(0, 10);

  // Préparer les données pour le graphique
  const xpAmounts = topProjects.map(projectName => xpByProject[projectName]);

  // Trouver la valeur maximale pour normaliser les hauteurs des barres
  const maxXP = Math.max(...xpAmounts);

  // Tableau de couleurs différentes pour chaque barre
  const colors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow', 'brown', 'pink', 'gray', 'cyan'];

  // Créer un élément SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '500'); // Définir la largeur du graphique SVG
  svg.setAttribute('height', '500'); // Définir la hauteur du graphique SVG

  // Déclarer barWidth à l'extérieur de la boucle
  const barWidth = 30;

  // Dessiner les barres du graphique en fonction des données
  for (let i = 0; i < topProjects.length; i++) {
    const projectName = topProjects[i];
    const xpAmount = xpByProject[projectName];
    const barHeight = (xpAmount / maxXP) * 200; // Normaliser la hauteur des barres

    // Créer un élément rect pour représenter la barre
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', i * (barWidth + 5)); // Espacement entre les barres
    rect.setAttribute('y', 300 - barHeight); // Inverser la hauteur pour que la barre pointe vers le haut
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', barHeight);
    rect.setAttribute('fill', colors[i]); // Utiliser une couleur différente pour chaque barre

    // Ajouter des données personnalisées à l'élément rect
    rect.dataset.projectName = projectName;
    rect.dataset.xpAmount = xpAmount;

    // Ajouter un gestionnaire d'événements pour le survol
    rect.addEventListener('mouseenter', handleMouseEnter);
    rect.addEventListener('mouseleave', handleMouseLeave);

    svg.appendChild(rect); // Ajouter la barre au graphique SVG
  }

  // Fonction pour gérer l'événement de survol
  function handleMouseEnter(event) {
    const target = event.target;
    showTooltip(target);
  }

  // Fonction pour gérer l'événement de sortie du survol
  function handleMouseLeave() {
    hideTooltip();
  }

  // Fonction pour afficher le tooltip
  function showTooltip(bar) {
    const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tooltip.setAttribute('x', parseFloat(bar.getAttribute('x')) + barWidth / 2);
    tooltip.setAttribute('y', parseFloat(bar.getAttribute('y')) - 5);
    tooltip.setAttribute('text-anchor', 'right');
    tooltip.textContent = `${bar.dataset.projectName}\n: ${ convertToKB(bar.dataset.xpAmount)}kb`;

    svg.appendChild(tooltip);
  }

  // Fonction pour masquer le tooltip
  function hideTooltip() {
    const tooltips = svg.querySelectorAll('text');
    tooltips.forEach(tooltip => svg.removeChild(tooltip));
  }

  // Retourner le graphique SVG créé
  return svg;
}


// Fonction pour charger les XP et afficher le graphique en barres
export async function loadXPAndDisplayChart() {
  // Vérifier si le JWT est présent
  if (jwt) {
    try {
      // Effectuer la requête pour récupérer les transactions XP
      const response = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              xpTransactions: transaction(
                where: {
                  type: { _eq: "xp" },
                  _and: [
                    { path: { _ilike: "/dakar/div-01%" } },
                    { path: { _nlike: "%/dakar/div-01/piscine-js/%" } },
                    { path: { _nlike: "%/dakar/div-01/piscine-js-2/%" } }
                  ]
                }
              ) {
                type
                amount
                path
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des XP');
      }

      const { data } = await response.json();

      // Appeler la fonction barXpProjet avec les données récupérées
      const xpChartContainer = document.getElementById('chart1');
      if (xpChartContainer) {
        // Vérifier s'il y a déjà un graphique SVG dans le conteneur
        if (xpChartContainer.children.length > 0) {
          // Si oui, le supprimer avant d'ajouter le nouveau graphique
          xpChartContainer.removeChild(xpChartContainer.children[0]);
        }

        const xpChart = barXpProjet(data.xpTransactions);

        // Ajouter le graphique à l'élément avec l'ID 'chart1'
        xpChartContainer.appendChild(xpChart);
      }

    } catch (error) {
      // console.error('Erreur lors du chargement des XP :', error.message);
    }
  }
}
/****************************************************************************************************************************/
// Fonction pour récupérer les transactions de compétences
async function fetchSkillTransactions(jwt) {
  try {
    const response = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            skillTransactions: transaction(
              where: {
                type: { _ilike: "%skill%" }
              }
            ) {
              type
              amount
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des compétences');
    }

    const { data } = await response.json();
    return data.skillTransactions;
  } catch (error) {
    // console.error('Erreur lors du chargement des compétences :', error.message);
    throw error; // Rethrow l'erreur pour la gestion à un niveau supérieur si nécessaire
  }
}

// Fonction pour créer le graphique des compétences
function createSkillChart(skillTransactions) {
  const svg = document.querySelector(".chart");
  const newWidth = 300; // Ajustez la largeur selon vos besoins
  const newHeight = 300; // Ajustez la hauteur selon vos besoins

  // Définis le rayon du cercle
  const radius = Math.min(newWidth, newHeight) / 2;

  // Définis les attributs width et height de l'élément SVG
  svg.setAttribute("width", newWidth);
  svg.setAttribute("height", newHeight);

  // Ajoute un groupe SVG pour contenir les éléments texte et légende
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.appendChild(group);

  // Ajoute un groupe pour la légende
  const legendGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.appendChild(legendGroup);

  // Définis les couleurs pour chaque compétence (à adapter selon vos préférences)
  const colors = ["red", "blue", "orange", "gray", "purple", "green", "#1abc9c"];

  // Crée un objet pour stocker le montant maximum de chaque compétence
  const maxAmounts = {};

  // Trouve le montant maximum pour chaque compétence
  skillTransactions.forEach(skill => {
    if (!maxAmounts[skill.type] || skill.amount > maxAmounts[skill.type]) {
      maxAmounts[skill.type] = skill.amount;
    }
  });

  // Calcule le total des montants
  const totalAmount = Object.values(maxAmounts).reduce((acc, val) => acc + val, 0);

  // Calcule l'angle initial
  let startAngle = 0;

  const relevantSkills = ["skill_go", "skill_js", "skill_html", "skill_css", "skill_unix", "skill_docker", "skill_sql"];

  relevantSkills.forEach(skill => {
    const amount = maxAmounts[skill];
    const percentage = ((amount / totalAmount) * 100).toFixed(2);

    const endAngle = (amount / totalAmount) * 360 + startAngle;

    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;

    const startX = radius * Math.cos(startRadians) + radius;
    const startY = radius * Math.sin(startRadians) + radius;
    const endX = radius * Math.cos(endRadians) + radius;
    const endY = radius * Math.sin(endRadians) + radius;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${radius} ${radius} L ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY} Z`);
    path.setAttribute("fill", colors[relevantSkills.indexOf(skill)]);

    group.appendChild(path);

    const textX = (startX + endX) / 2;
    const textY = (startY + endY) / 2;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", textX);
    text.setAttribute("y", textY);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("alignment-baseline", "middle");
    text.textContent = `${percentage}%`;

    group.appendChild(text);

    const legendItem = document.createElementNS("http://www.w3.org/2000/svg", "text");
    legendItem.setAttribute("x", newWidth - 30);
    legendItem.setAttribute("y", startAngle + 20);
    legendItem.setAttribute("text-anchor", "start");
    legendItem.setAttribute("fill", colors[relevantSkills.indexOf(skill)]);
    legendItem.textContent = `${skill} (${percentage}%)`;

    legendGroup.appendChild(legendItem);

    startAngle = endAngle;
  });

  return svg;
}

export async function loadSkills() {
  // Vérifier si le JWT est présent
  const jwt = localStorage.getItem('jwt');
  if (jwt) {
    try {
      // Récupérer les transactions de compétences
      const skillTransactions = await fetchSkillTransactions(jwt);

      // Filtrer les compétences pertinentes
      const relevantSkills = ["skill_go", "skill_js", "skill_html", "skill_css", "skill_unix", "skill_docker", "skill_sql"];
      const filteredSkills = skillTransactions.filter(skill => relevantSkills.includes(skill.type));

      // Créer le graphique des compétences
      createSkillChart(filteredSkills);
    } catch (error) {
      // console.error('Erreur lors du chargement des compétences :', error.message);
    }
  }
}