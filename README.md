# 📱 SMS Internazionale

Un'applicazione web moderna per l'invio di SMS internazionali con design liquid glass ispirato a iOS.

## ✨ Caratteristiche

- 🎨 **Design Liquid Glass** - Interfaccia moderna con effetti glassmorphism
- 🌙 **Tema Scuro** - Design elegante per l'uso notturno
- 📱 **Responsive** - Ottimizzato per tutti i dispositivi
- 🌍 **SMS Internazionali** - Supporto per prefissi internazionali
- ⚡ **Real-time** - Validazione e feedback istantanei
- 💰 **Gratuito** - Servizio SMS gratuito (con limitazioni)

## 🚀 Tecnologie

- **Next.js 14+** - Framework React per produzione
- **TypeScript** - Type safety e migliore DX
- **Tailwind CSS** - Styling utility-first
- **Framer Motion** - Animazioni fluide
- **React Hook Form** - Gestione form performante
- **Zod** - Validazione schema
- **Lucide React** - Icone moderne

## 🛠️ Installazione

1. Clona il repository:
```bash
git clone <repository-url>
cd sms-online
```

2. Installa le dipendenze:
```bash
npm install
```

3. Avvia il server di sviluppo:
```bash
npm run dev
```

4. Apri [http://localhost:3000](http://localhost:3000) nel browser

## 📋 Utilizzo

1. **Inserisci il prefisso** - Seleziona il prefisso internazionale (es. +39 per Italia)
2. **Numero di telefono** - Inserisci il numero senza prefisso
3. **Messaggio** - Scrivi il tuo messaggio (max 160 caratteri)
4. **Invia** - Clicca il pulsante per inviare l'SMS

## 🔧 API

Il progetto utilizza l'API gratuita di TextBelt per l'invio degli SMS:
- **Limite**: 1 SMS gratuito al giorno per IP
- **Endpoint**: `/api/send-sms`
- **Metodo**: POST

### Esempio di richiesta:
```json
{
  "phone": "+393331234567",
  "message": "Ciao! Questo è un messaggio di test."
}
```

## 🎯 Struttura del Progetto

```
src/
├── app/
│   ├── api/send-sms/     # API endpoint per SMS
│   ├── globals.css       # Stili globali
│   ├── layout.tsx        # Layout principale
│   └── page.tsx          # Homepage
├── components/
│   └── SMSForm.tsx       # Componente form SMS
```

## ⚠️ Limitazioni

- **Servizio Gratuito**: 1 SMS al giorno per IP
- **Solo Numeri Reali**: Il servizio funziona solo con numeri di telefono validi
- **Rate Limiting**: Potrebbero esserci limitazioni aggiuntive dal provider

## 🚀 Deploy

Il progetto è pronto per il deploy su:
- **Vercel** (raccomandato)
- **Netlify**
- **Railway**
- **Altri provider Next.js**

## 📝 License

MIT License - vedi il file LICENSE per i dettagli.
