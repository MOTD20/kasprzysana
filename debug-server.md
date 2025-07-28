# 🔍 Debug Server Error - Rejestracja

## 📊 **Status aplikacji:**
- ✅ Aplikacja działa na `https://kasprzysana.onrender.com`
- ✅ MongoDB jest połączone (`"mongodb":"connected"`)
- ✅ Zmienne środowiskowe są ustawione (`"hasMongoUri":true`)
- ❌ Błąd serwera przy rejestracji

## 🔧 **Możliwe przyczyny błędu:**

### 1. Sprawdź logi serwera w Render:
1. Idź do [Render Dashboard](https://dashboard.render.com)
2. Kliknij na aplikację "kasprzysana"
3. Przejdź do zakładki **Logs**
4. Sprawdź błędy związane z rejestracją

### 2. Sprawdź endpoint rejestracji:
```bash
curl -X POST https://kasprzysana.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 3. Możliwe problemy:
- **Walidacja danych** - sprawdź czy wszystkie pola są wymagane
- **Błąd w kodzie rejestracji** - sprawdź logi serwera
- **Problem z hashowaniem hasła** - sprawdź bcrypt
- **Problem z JWT** - sprawdź JWT_SECRET

## 🎯 **Następne kroki:**
1. Sprawdź logi w Render
2. Przetestuj endpoint rejestracji
3. Podziel się błędami z logów

## 📞 **Jeśli potrzebujesz pomocy:**
Skopiuj i wklej błędy z logów Render, żebym mógł pomóc z debugowaniem. 