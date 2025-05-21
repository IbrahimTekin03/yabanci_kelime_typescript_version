# Yabancı Kelime Oyunu (TypeScript Version)

Bu proje, Express.js ve TypeScript kullanılarak geliştirilmiş bir yabancı kelime öğrenme oyunudur. Kullanıcılar kayıt olabilir, giriş yapabilir, kelime ekleyebilir ve oyun oynayabilirler. Proje JWT ile kimlik doğrulama ve rol tabanlı yetkilendirme içerir.

---

## Kurulum ve Çalıştırma

### 1. **Projeyi Klonla**
```sh
git clone https://github.com/IbrahimTekin03/yabanci_kelime_typescript_version.git
cd yabanci_kelime_typescript_version

cd src
npm install
npm install --save-dev ts-node typescript @types/node
npx tsc
npx npx ts-node .\main.ts   #src klasörü içerisinde olduğunuza dikkat edin
```
---
### 2. **Veritabanını Kur

Proje klasöründe `yabanci_kelime_task.sql` dosyası bulunmaktadır. Bu dosya ile veritabanını kolayca kurabilirsiniz.

1. **MySQL/MariaDB’de yeni bir veritabanı oluşturun:**
   ```sql
   CREATE DATABASE yabanci_kelime_task CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Veritabanı dump’ını içeri aktarın:**
   Komutu proje ana klasöründe çalıştırın:
   ```sh
   mysql -u KULLANICI_ADI -p yabanci_kelime_task < yabanci_kelime_task.sql
   ```
   
   > `KULLANICI_ADI` yerine kendi MySQL kullanıcı adınızı yazın. Şifre istenirse girin.

3. **Ortam değişkenlerini ayarlayın (gerekirse):**

    src/db/dcConnection.js dosyasındaki db bilgilerini kendinize göre ayarlayın.


### Kurulan Temel Paketler
```sh
express
sequelize
mysql2
bcrypt
jsonwebtoken
http-errors
cors
@hapi/joi
typescript
ts-node
nodemon
```