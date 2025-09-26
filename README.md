Installation projet 

### Clone le projet :
git clone https://github.com/FATOUSHA-WADE/Todo-Full-Js
cd Nom_projet 

### Installe les dépendances (backend + frontend si tu en as un) :
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install



Configuration
Variables d’environnement :
### Créer un fichier .env à la racine du backend avec :
  DATABASE_URL=mysql://Nom_Utilisateur:motDePasse@localhost:3306/Nom_base-donnée
  JWT_ACCESS_SECRET='ton key token'
  JWT_REFRESH_SECRET='ton key token'



### Commandes utiles
---Lancer le backend :
  cd backend && npm run dev
---Lancer le frontend :
  cd frontend && npm start
---Migrer la base :
  cd backend && npx prisma migrate dev
---Générer le client Prisma :
  cd backend && npx prisma generate




### L’application sera disponible sur :
  Frontend : http://localhost:5173/
  Backend API : http://localhost:3300/



### IdentifiantS de connexion pour tester directement :
  Login : fatou@gmail.com
  Mot de passe : fatou25

  Login : sokhna@gmail.com
  Mot de passe : sokhna2




Installations (backend et frontend):
---Backend:
### Installation des dépendances Node.js (dans le dossier backend) :
   npm install
### Installation de Prisma (ORM pour la base de données) :
  npm install prisma @prisma/client
### Installation de Cloudinary (pour l’upload des fichiers) :
  npm install cloudinary
### Installation de Multer (pour l’upload des fichiers en multipart/form-data) :
  npm install multer
### Installation de dotenv (pour gérer les variables d’environnement) :
  npm install dotenv

---Frontend:
### Installation des dépendances React (dans le dossier frontend) :
  npm install
### Installation de React Icons (pour les icônes) :
  npm install react-icons
### Installation d’Axios (pour les requêtes HTTP) :
  npm install axios
### Installation de React Router (pour la navigation) :
  npm install react-router-dom
### Installation de Tailwind CSS (pour le design, si utilisé) :
  npm install tailwindcss


  
### Commandes principales
---Backend:
### Lancer le serveur backend :
  npm run dev
### Lancer les migrations Prisma (pour créer ou mettre à jour la base de données) :
  npx prisma migrate dev
Générer le client Prisma :
npx prisma generate

---Frontend
Lancer le serveur frontend (React) :
  npm run dev


  
