-- Services de départ (promotion réelle). PRIX = EXEMPLES À AJUSTER dans l'admin.
insert into public.services (network, category, name, description, price_per_1000, min_qty, max_qty, eta, link_hint, sort_order) values
('facebook','Promotion','Promotion de publication Facebook','Campagne de mise en avant de ta publication auprès d’une audience ciblée.',1500,1000,100000,'24 à 72 h','Lien de la publication',1),
('facebook','Promotion','Promotion de page Facebook','Mise en avant de ta page pour attirer de nouveaux abonnés intéressés.',2000,1000,100000,'2 à 5 jours','Lien de la page',2),
('instagram','Promotion','Promotion de publication Instagram','Mise en avant de ta publication ou de ton Reel.',1500,1000,100000,'24 à 72 h','Lien de la publication',3),
('tiktok','Promotion','Promotion de vidéo TikTok','Diffusion de ta vidéo auprès d’une audience ciblée.',1500,1000,100000,'24 à 72 h','Lien de la vidéo',4),
('youtube','Promotion','Promotion de vidéo YouTube','Campagne de promotion conforme aux règles YouTube.',2500,1000,100000,'2 à 5 jours','Lien de la vidéo',5),
('youtube','Promotion','Promotion de chaîne YouTube','Campagne de promotion de ta chaîne.',3000,1000,100000,'3 à 7 jours','Lien de la chaîne',6),
('x','Promotion','Promotion de publication X','Mise en avant de ta publication.',1500,1000,100000,'24 à 72 h','Lien de la publication',7),
('threads','Promotion','Promotion de publication Threads','Mise en avant de ta publication.',1500,1000,100000,'24 à 72 h','Lien de la publication',8),
('telegram','Promotion','Promotion de communauté Telegram','Promotion de ton groupe ou de ta chaîne.',2000,1000,100000,'2 à 5 jours','Lien du groupe ou de la chaîne',9),
('whatsapp','Promotion','Promotion de chaîne WhatsApp','Promotion de ta chaîne WhatsApp.',2000,1000,100000,'2 à 5 jours','Lien de la chaîne',10);
