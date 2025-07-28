# 🔍 Sprawdź status wdrożenia Kasprzysana

## 📊 **Status aplikacji:**
- ✅ Aplikacja odpowiada na `https://kasprzysana.onrender.com`
- ❌ Zwraca błąd serwera - prawdopodobnie brak bazy danych

## 🔧 **Następne kroki:**

### 1. Sprawdź logi w Render:
1. Idź do [Render Dashboard](https://dashboard.render.com)
2. Kliknij na aplikację "kasprzysana"
3. Przejdź do zakładki **Logs**
4. Sprawdź czy są błędy związane z MongoDB

### 2. Skonfiguruj MongoDB Atlas:
1. Idź do [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Utwórz darmowe konto
3. Utwórz nowy cluster (darmowy tier)
4. **Database Access:**
   - Kliknij "Add New Database User"
   - Username: `kasprzysana-user`
   - Password: `twoje-bezpieczne-haslo`
   - Role: `Read and write to any database`
5. **Network Access:**
   - Kliknij "Add IP Address"
   - Wybierz "Allow Access from Anywhere" (0.0.0.0/0)
6. **Pobierz connection string:**
   - Kliknij "Connect"
   - Wybierz "Connect your application"
   - Skopiuj connection string

### 3. Dodaj zmienne środowiskowe w Render:
1. W Render dashboard, przejdź do **Environment**
2. Dodaj te zmienne:

```
NODE_ENV=production
JWT_SECRET=twoj-super-sekretny-klucz-jwt-zmien-to-na-cos-bezpiecznego
MONGODB_URI=mongodb+srv://kasprzysana-user:twoje-haslo@cluster.mongodb.net/kasprzysana
```

### 4. Zrestartuj aplikację:
Po dodaniu zmiennych, Render automatycznie zrestartuje aplikację.

## 🎯 **Po skonfigurowaniu:**
- Aplikacja powinna działać na `https://kasprzysana.onrender.com`
- Możesz utworzyć konto i zalogować się
- Wszystkie funkcje będą działać

## 📞 **Jeśli nadal masz problemy:**
Sprawdź logi w Render i podziel się błędami, które widzisz. 