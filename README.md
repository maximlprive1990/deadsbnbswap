# 💀 DEADS SWAP - BSC Token Exchange

Un DEX avec thème gothique pour échanger des tokens DEADS sur la Binance Smart Chain.

## 🎯 Fonctionnalités

### ⚡ Swap Automatique
- **Prix fixe** : 0.0002 BNB = 5 DEADS
- **Taux affiché** : 1 BNB = 25,000 DEADS
- **Achat instantané** sans saisie de montant
- **Vente flexible** avec montant personnalisé

### 🔄 Swap Manuel (Fallback)
- **Adresse de destination** : `0x5E02B3C73a9285aa17E5E3F6D1a3bdF6Ac7ae6E3`
- **Délai maximum** : 24 heures
- **Service garanti** même si le contrat ne fonctionne pas

### 🎨 Design
- **Thème skull gothique** avec animations
- **Police Cinzel** pour l'esthétique
- **Animations CSS** avec crânes pulsants
- **Responsive design** mobile-friendly

## 📋 Configuration

### Contrat BSC
- **Adresse** : `0xb2855c8c0b9af305281d7b417cb2158ed8dc676d`
- **Réseau** : BSC Mainnet (Chain ID: 56)
- **Token** : DEADS

### Prix Fixe
```javascript
const FIXED_PRICE_BNB = "0.0002";    // 0.0002 BNB
const FIXED_DEADS_AMOUNT = "5";      // 5 DEADS
const FIXED_RATE_DISPLAY = "25000";  // 1 BNB = 25,000 DEADS
```

## 🚀 Déploiement GitHub Pages

### Fichiers nécessaires :
- `index.html` - Page principale
- `app.js` - Logique JavaScript

### Instructions :
1. Créer un repository GitHub
2. Uploader `index.html` et `app.js` à la racine
3. Activer GitHub Pages dans Settings
4. Accéder à `https://username.github.io/repo-name`

## 🔧 Fonctionnalités Techniques

### Web3 Integration
- **MetaMask** connection automatique
- **BSC Network** auto-switch
- **Gas estimation** intelligente
- **Transaction tracking** en temps réel

### Gestion d'erreurs
- **Static calls** pour validation pré-transaction
- **Fallback gas limits** si estimation échoue
- **Messages d'erreur détaillés**
- **Status updates** pendant les transactions

### Interface utilisateur
- **Tabs dynamiques** Buy/Sell
- **Balance display** en temps réel
- **Toast notifications** pour feedback
- **Loading animations** avec crânes

## 💰 Logique de Prix

### Achat (Prix Fixe)
```javascript
// L'utilisateur paie toujours 0.0002 BNB
// L'utilisateur reçoit toujours 5 DEADS
// Pas de calcul dynamique pour l'achat
```

### Vente (Prix Dynamique)
```javascript
// Utilise le prix du contrat pour la vente
// Permet à l'utilisateur de choisir le montant
// Calcul basé sur le taux du contrat
```

## 🎭 Messages de Statut

### Succès
- `"Wallet connected to BSC! 💀"`
- `"Success! You received 5 DEADS for 0.0002 BNB! 💀"`
- `"DEADS sold successfully! 💀"`

### Erreurs
- `"Insufficient BNB balance"`
- `"Transaction would fail. Check contract conditions."`
- `"Transaction rejected by user"`

### Info
- `"Processing transaction..."`
- `"Transaction sent! Hash: {hash}"`

## 🔒 Sécurité

- **Input validation** pour tous les montants
- **Balance checks** avant transactions
- **Network verification** (BSC uniquement)
- **Static call testing** avant envoi réel
- **Error handling** complet

## 📱 Compatibilité

- ✅ Desktop (Chrome, Firefox, Safari)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ MetaMask Browser
- ✅ Tous les wallets Web3 compatibles

## 🎨 Personnalisation

### Couleurs principales
- **Skull theme** : Noirs, gris, blanc os
- **Accents** : Rouge sang, orange
- **Success** : Vert néon
- **Error** : Rouge vif

### Fonts
- **Principale** : Cinzel (Gothic)
- **Monospace** : Courier New (Adresses)

---

*Powered by the underworld • BSC Network 💀*
