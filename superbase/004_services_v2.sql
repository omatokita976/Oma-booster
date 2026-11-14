-- Parcours de commande en étapes : regroupement des services et options (Standard / Prioritaire).
-- À exécuter UNE SEULE fois, après seed.sql.
alter table public.services add column group_title text, add column option_label text;

update public.services set option_label = 'Standard', group_title = case name
  when 'Promotion de publication Facebook'  then 'Promotion de votre publication'
  when 'Promotion de page Facebook'         then 'Promotion de votre page'
  when 'Promotion de publication Instagram' then 'Promotion de votre publication'
  when 'Promotion de vidéo TikTok'          then 'Promotion de votre vidéo'
  when 'Promotion de vidéo YouTube'         then 'Promotion de votre vidéo'
  when 'Promotion de chaîne YouTube'        then 'Promotion de votre chaîne'
  when 'Promotion de publication X'         then 'Promotion de votre publication'
  when 'Promotion de publication Threads'   then 'Promotion de votre publication'
  when 'Promotion de communauté Telegram'   then 'Promotion de votre communauté'
  when 'Promotion de chaîne WhatsApp'       then 'Promotion de votre chaîne'
  else name end
where group_title is null;

-- Options « Prioritaire » (prix d'exemple, à ajuster dans l'admin)
insert into public.services (network, category, name, description, price_per_1000, min_qty, max_qty, eta, link_hint, sort_order, group_title, option_label) values
('facebook','Promotion','Promotion de publication Facebook — Prioritaire','Mise en avant prioritaire de ta publication.',2400,1000,100000,'12 à 24 h','Lien de la publication',1,'Promotion de votre publication','Prioritaire'),
('facebook','Promotion','Promotion de page Facebook — Prioritaire','Mise en avant prioritaire de ta page.',3000,1000,100000,'1 à 2 jours','Lien de la page',2,'Promotion de votre page','Prioritaire'),
('instagram','Promotion','Promotion de publication Instagram — Prioritaire','Mise en avant prioritaire.',2400,1000,100000,'12 à 24 h','Lien de la publication',3,'Promotion de votre publication','Prioritaire'),
('tiktok','Promotion','Promotion de vidéo TikTok — Prioritaire','Diffusion prioritaire de ta vidéo.',2400,1000,100000,'12 à 24 h','Lien de la vidéo',4,'Promotion de votre vidéo','Prioritaire'),
('youtube','Promotion','Promotion de vidéo YouTube — Prioritaire','Campagne prioritaire conforme aux règles YouTube.',3600,1000,100000,'1 à 2 jours','Lien de la vidéo',5,'Promotion de votre vidéo','Prioritaire');
