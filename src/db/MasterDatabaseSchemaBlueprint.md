# 🗄️ Master Database Schema & Relationship Blueprint
**Project:** Historical Puthia Smart Digital Citizen Hub
**Architecture:** Relational Database (MySQL 8 / Eloquent Schema) & Document Firestore Blueprint Sync
**Date:** August 2026

---

## 📌 ১. ERD Relationship Diagram Overview

```
                      +-------------------+
                      |   roles & perms   |
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      |       users       |
                      +---------+---------+
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
+---------------+       +---------------+       +---------------+
| user_profiles |       |  businesses   |       | doctor_profiles|
+---------------+       +---------------+       +---------------+
        |                       |                       |
        | BelongsTo             | BelongsTo             | BelongsTo
        v                       v                       v
+---------------+       +---------------+       +---------------+
|    unions     |<------|  categories   |<------|  hospitals    |
+---------------+       +---------------+       +---------------+
        |                                               |
        v BelongsTo                                     v HasMany
+---------------+                               +---------------+
|   villages    |                               | appointments  |
+---------------+                               +---------------+
```

---

## 📑 ২. টেবিল স্ট্রাকচার ও রিলেশনশিপ ডিটেইলস (MySQL & Firestore Standard)

### A. Core Identity & RBAC Tables (ব্যবহারকারী ও অ্যাক্সেস কন্ট্রোল)

#### 1. `users` (মূল অ্যাকাউন্ট)
- `id` (BIGINT PK / UUID String)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `phone` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `role` (ENUM: `'user'`, `'provider'`, `'business_owner'`, `'moderator'`, `'admin'`, `'super_admin'`)
- `status` (ENUM: `'active'`, `'suspended'`, `'pending'`)
- `created_at`, `updated_at` (TIMESTAMP)

**Relationships:**
- `HasOne(UserProfile)`
- `HasMany(Business)`
- `HasMany(Application)`
- `HasMany(Review)`
- `HasMany(Favorite)`
- `HasMany(Notification)`

#### 2. `user_profiles` (ব্যবহারকারীর বিস্তারিত প্রোফাইল)
- `id` (BIGINT PK / UUID)
- `user_id` (FK -> `users.id`, ON DELETE CASCADE)
- `union_id` (FK -> `unions.id`, NULLABLE)
- `village_id` (FK -> `villages.id`, NULLABLE)
- `occupation` (VARCHAR)
- `blood_group` (VARCHAR: A+, B+, O+, etc.)
- `nid_number` (VARCHAR, NULLABLE)
- `avatar_url` (VARCHAR, NULLABLE)
- `is_verified` (BOOLEAN, DEFAULT: false)
- `reward_points` (INTEGER, DEFAULT: 0)
- `reward_badge` (VARCHAR, DEFAULT: 'নবীন নাগরিক')

**Relationships:**
- `BelongsTo(User)`
- `BelongsTo(Union)`
- `BelongsTo(Village)`

#### 3. `roles` & `permissions` (Spatie RBAC Model)
- `roles`: `id`, `name` (`user`, `provider`, `business_owner`, `moderator`, `admin`), `guard_name`
- `permissions`: `id`, `name` (`view_dashboard`, `edit_services`, `approve_verification`, `manage_users`), `guard_name`
- `model_has_roles`: `role_id`, `model_type`, `model_id`
- `role_has_permissions`: `permission_id`, `role_id`

---

### B. Geo-Location & Administrative Taxonomy Tables (ভৌগোলিক ও প্রশাসনিক কাঠামো)

#### 4. `locations` (জেলা ও উপজেলা)
- `id` (BIGINT PK / UUID)
- `division` (VARCHAR, Default: 'Rajshahi')
- `district` (VARCHAR, Default: 'Rajshahi')
- `upazila` (VARCHAR, Default: 'Puthia')
- `postal_code` (VARCHAR, Default: '6260')

**Relationships:**
- `HasMany(Union)`

#### 5. `unions` (ইউনিয়ন পরিষদ)
- `id` (BIGINT PK / UUID)
- `location_id` (FK -> `locations.id`)
- `name_bn` (VARCHAR) - যেমন: 'পুঠিয়া সদর', 'বানেশ্বর', 'বেলপুকুরিয়া'
- `name_en` (VARCHAR)
- `chairman_name` (VARCHAR)
- `phone` (VARCHAR)
- `address` (TEXT)

**Relationships:**
- `BelongsTo(Location)`
- `HasMany(Village)`
- `HasMany(UserProfile)`

#### 6. `villages` (গ্রাম/ওয়ার্ড)
- `id` (BIGINT PK / UUID)
- `union_id` (FK -> `unions.id`, ON DELETE CASCADE)
- `name_bn` (VARCHAR)
- `ward_number` (VARCHAR)

**Relationships:**
- `BelongsTo(Union)`

---

### C. Category & Directory Service Tables (সেবা ও বাণিজ্যিক ডিরেক্টরি)

#### 7. `categories` (ক্যাটাগরি ডিরেক্টরি)
- `id` (BIGINT PK / UUID)
- `name` (VARCHAR) - যেমন: 'চিকিৎসা', 'জরুরি সেবা', 'ব্যবসা প্রতিষ্ঠান', 'শিক্ষা'
- `slug` (VARCHAR, UNIQUE)
- `icon` (VARCHAR)
- `type` (ENUM: `'service'`, `'business'`, `'health'`, `'tourism'`, `'post'`)

**Relationships:**
- `HasMany(Service)`
- `HasMany(Business)`

#### 8. `services` (ডিজিটাল ও সরকারি সেবা)
- `id` (BIGINT PK / UUID)
- `category_id` (FK -> `categories.id`)
- `title` (VARCHAR)
- `slug` (VARCHAR, UNIQUE)
- `fee` (DECIMAL(10,2), DEFAULT: 0.00)
- `processing_time` (VARCHAR)
- `required_documents` (JSON / TEXT)
- `is_active` (BOOLEAN, DEFAULT: true)

**Relationships:**
- `BelongsTo(Category)`
- `HasMany(Application)`

#### 9. `businesses` (স্থানীয় ব্যবসা ও দোকান লিস্টিং)
- `id` (BIGINT PK / UUID)
- `user_id` (FK -> `users.id`, Owner)
- `category_id` (FK -> `categories.id`)
- `union_id` (FK -> `unions.id`)
- `title` (VARCHAR)
- `owner_name` (VARCHAR)
- `phone` (VARCHAR)
- `address` (TEXT)
- `trade_license_no` (VARCHAR, NULLABLE)
- `rating` (DECIMAL(3,2), DEFAULT: 5.0)
- `is_verified` (BOOLEAN, DEFAULT: false)
- `status` (ENUM: `'active'`, `'pending'`, `'rejected'`)

**Relationships:**
- `BelongsTo(User)`
- `BelongsTo(Category)`
- `BelongsTo(Union)`
- `HasMany(Review)`

---

### D. Healthcare & Emergency Services (স্বাস্থ্য ও জরুরি সেবা)

#### 10. `hospitals` (হাসপাতাল ও ডায়াগনস্টিক সেন্টার)
- `id` (BIGINT PK / UUID)
- `union_id` (FK -> `unions.id`)
- `name` (VARCHAR)
- `type` (ENUM: `'government'`, `'private'`, `'diagnostic'`)
- `phone` (VARCHAR)
- `address` (TEXT)
- `rating` (DECIMAL(3,2), DEFAULT: 4.8)

**Relationships:**
- `BelongsTo(Union)`
- `HasMany(DoctorProfile)`

#### 11. `doctor_profiles` (ডাক্তার তালিকা)
- `id` (BIGINT PK / UUID)
- `user_id` (FK -> `users.id`, NULLABLE)
- `hospital_id` (FK -> `hospitals.id`, ON DELETE SET NULL)
- `name` (VARCHAR)
- `specialty` (VARCHAR)
- `qualification` (VARCHAR)
- `bmdc_reg_no` (VARCHAR)
- `chamber_address` (TEXT)
- `visiting_hours` (VARCHAR)
- `phone` (VARCHAR)

**Relationships:**
- `BelongsTo(User)`
- `BelongsTo(Hospital)`

#### 12. `blood_donors` (রক্তদাতা তালিকা)
- `id` (BIGINT PK / UUID)
- `user_id` (FK -> `users.id`, ON DELETE CASCADE)
- `blood_group` (VARCHAR)
- `phone` (VARCHAR)
- `union_id` (FK -> `unions.id`)
- `last_donated_at` (DATE, NULLABLE)
- `is_available` (BOOLEAN, DEFAULT: true)

**Relationships:**
- `BelongsTo(User)`
- `BelongsTo(Union)`

---

### E. User Interactions, Reviews, Verification & Notifications (ইন্টারঅ্যাকশন ও নিরাপত্তা)

#### 13. `applications` (নাগরিকদের সেবা আবেদন)
- `id` (BIGINT PK / UUID)
- `user_id` (FK -> `users.id`)
- `service_id` (FK -> `services.id`)
- `status` (ENUM: `'submitted'`, `'processing'`, `'approved'`, `'rejected'`)
- `submitted_documents` (JSON)
- `admin_notes` (TEXT, NULLABLE)

**Relationships:**
- `BelongsTo(User)`
- `BelongsTo(Service)`

#### 14. `reviews` (রিভিউ ও স্টার রেটিং)
- `id` (BIGINT PK / UUID)
- `user_id` (FK -> `users.id`)
- `target_id` (VARCHAR) - (Business ID, Hospital ID, Doctor ID)
- `target_type` (VARCHAR) - ('business', 'hospital', 'doctor')
- `rating` (INTEGER, 1 to 5)
- `comment` (TEXT)

**Relationships:**
- `BelongsTo(User)`

#### 15. `favorites` (সংরক্ষিত বুকমার্ক)
- `id` (BIGINT PK / UUID)
- `user_id` (FK -> `users.id`, ON DELETE CASCADE)
- `item_id` (VARCHAR)
- `item_type` (VARCHAR)
- `item_title` (VARCHAR)

**Relationships:**
- `BelongsTo(User)`

#### 16. `verifications` (ব্লু-ব্যাজ ও ট্রেড লাইসেন্স সত্যায়ন আবেদন)
- `id` (BIGINT PK / UUID)
- `user_id` (FK -> `users.id`)
- `doc_type` (ENUM: `'nid'`, `'trade_license'`, `'bmdc'`, `'student_id'`)
- `doc_number` (VARCHAR)
- `doc_file_url` (VARCHAR)
- `status` (ENUM: `'pending'`, `'verified'`, `'rejected'`)

**Relationships:**
- `BelongsTo(User)`

#### 17. `notifications` (ইন-অ্যাপ নোটিফিকেশন)
- `id` (BIGINT PK / UUID)
- `user_id` (FK -> `users.id`, ON DELETE CASCADE)
- `title` (VARCHAR)
- `message` (TEXT)
- `type` (VARCHAR) - ('system', 'application', 'approval', 'news')
- `is_read` (BOOLEAN, DEFAULT: false)

**Relationships:**
- `BelongsTo(User)`

---

## 🎯 ৩. ফ্রন্টএন্ড UI-এর সঙ্গে ব্যাকএন্ড ডাটাবেজ ইন্টিগ্রেশন কৌশল

১. **জিরো ফ্রন্টএন্ড ব্রেকিং (Zero UI Breaking):**
   - বর্তমান ফ্রন্টএন্ডের সকল ৬০টি পেজ এবং সেগুলোর স্টেট ম্যানেজমেন্ট অক্ষুণ্ণ থাকবে।
২. **ইউনিভার্সাল এপিআই ও ফায়ারস্টোর সিংক্রোনাইজেশন:**
   - ফায়ারস্টোর কালেকশন নামসমূহ (`users`, `services`, `businesses`, `doctors`, `hospitals`, `blood_donors`, `applications`, `reviews`, `favorites`, `notifications`) উপরে উল্লেখ করা রিলেশনাল টেবিল ডেটা স্ট্রাকচারের সাথে **১:১ ম্যাপিং** অনুসরণ করবে।
৩. **রিলেশন ইনটেগ্রিটি অন ডিলেট:**
   - মূল ইউজার বা সার্ভিস ডিলেট হলে চাইল্ড রিভিউ বা বুকমার্ক স্বয়ংক্রিয়ভাবে ক্যাসকেড (`ON DELETE CASCADE`) হবে।
