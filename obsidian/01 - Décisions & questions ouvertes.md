---
type: spec
status: draft
created: 2026-07-22
updated: 2026-07-22
tags:
  - webapp
  - decisions
  - brainstorming
source:
  - "00 - Cas d'utilisation"
---

# WebApp — Décisions & questions ouvertes

Journal des décisions prises pendant le brainstorming, et liste des points encore à trancher. Complète [[00 - Cas d'utilisation]].

---

## ✅ Décisions prises

| # | Décision | Détail |
|---|----------|--------|
| D1 | **Forme & stack** | Application **web sur Hostinger Business Web Hosting** : runtime **Node.js (Next.js)** ou **Python**, base **MySQL/MariaDB**, système de fichiers **persistant** (uploads sur disque local possibles), port injecté via `$PORT`, HTTPS auto. Détails → [[Guide technique pour développeurs]]. *(Choix Node/Next vs Python à arrêter à la spec technique.)* |
| D2 | **Modèle du temps** | **Calendrier réel par année civile** (2026, 2027…). *Précision Culture (2026-07-23)* : dans le domaine Culture, l’unité opérationnelle est le **jour** (dates `YYYY-MM-DD`, durées en jours) — pas de maille « semaine 1…52 » en stockage/UI Culture (voir CE-2 dans [[E - Culture (spec)]]). La découpe en semaines peut rester une vue d’agrégation ailleurs (stats, charge) si besoin. |
| D3 | **Méthode** | On capture d'abord tous les cas d'usage, puis on découpe en sous-systèmes ; chaque domaine aura sa propre spec + plan. |
| D4 | **Itinéraire technique** | **Modèle par espèce, ajustable par lot** : chaque espèce porte un itinéraire type (étapes + durées), chaque lot en hérite et peut ajuster ses durées. Pilote le moteur de cascade (UC-E3.3/E3.4). |
| D5 | **Architecture** | **API-first** : cœur métier exposé par une API, consommée par le back-office et le **storefront**. Chaque action clé **émet un webhook documenté** (contrats versionnés) pour brancher un **module comptable** plus tard, sans refonte. Compta = hors périmètre V1. |
| D6 | **Nommage terrain** | **Parcelle** = lettres `^[A-Z]+$` (ex. `SA`, `GA`). **Planche** = numéros `[0-9]{2,3}` dans la parcelle ; code complet **`{lettres}-{numeros}`** (ex. `SA-01`, `GA-01`), unique. Ex. 1ʳᵉ planche du 1ᵉʳ tunnel = parcelle `SA` + planche `01`. Voir [[E - Culture (spec)]] CE-1. |
| D7 | **Volet import / achats** | Matières achetées (hors ferme), en **deux provenances** : **Matière d'importation** 🟠 (agricole, cultivée ailleurs — poivre, cannelle…) et **Consommable de base** ⚪ (non cultivable — sel, sucre, vinaigre, alcool neutre, huile…). Prix d'achat/kg (ou /L) → **coût de revient recette** (UC-A1.5/A1.6 → A2.5 → marge A4). Entrées via **achats**, suivies en stock matière. |
| D13 | **Vocabulaire** | Termes distincts imposés partout : **Produit fini** (vendu) · **Matière fermière** 🟢 (cultivée ferme) · **Matière d'importation** 🟠 (cultivée hors ferme, achetée) · **Consommable de base** ⚪ (non cultivable, achetée). « Matière » = générique des 3, avec un champ **provenance**. Glossaire = §1 de [[00 - Cas d'utilisation]]. |
| D8 | **Storefront** | = **front de vente interne** (saisie rapide des ventes, déstockage, webhooks). Pas de boutique publique / paiement en ligne au V1. Une boutique publique pourra se brancher plus tard sur la même API. |
| D9 | **Clients, PdV, commandes & historique** | **Au V1** : **fiches clients** + historique (commandes, ventes, notes) ; **points de vente** = canaux (jours/dates livraison) ; **commandes** (client + canal + `date_livraison`) ; ventes directes (client optionnel) + ventes issues des livraisons. Voir [[B - Commercial (spec)]]. |
| D10 | **Pas de vue pluriannuelle** | L'app raisonne **en année civile** (D2) ; la vue business-plan N1→N9 (revenu brut/net par année de l'onglet `Produit`) **reste dans Excel**, hors app. |
| D11 | **Temps de travail** | Agréger le **temps requis** des étapes (recette + culture) → temps main d'œuvre par lot/unité ; **taux horaire** paramétrable → coût main d'œuvre **optionnel** dans le prix de revient (UC-A4.6) et vue charge (UC-T8). |
| D12 | **Statistiques** | Une **page stats générale** + **une page par topic** (ventes, production, stock, culture, marges, charge de travail) (UC-T8). |
| D14 | **Multi-utilisateur** | **Multi-utilisateur dès le V1** (Q-U1), auth simple **login/mot de passe**. Le **nom de l'opérateur** est tracé sur les actions (production, récolte…). Rôles/permissions fins = plus tard. |
| D15 | **Traçabilité obligatoire** | Chaîne **Parcelle → Planche → Récolte → Séchage → Transformation → Produit** obligatoire et remontable (Q-C1). **Séchage** = C0 `type=sechage` ; **Transformation** = production C1 ; autres C0 intercalés si besoin. **À chaque étape** : saisie d’un **poids** (`poids_kg`) et de **notes** (texte libre) — voir CC-12 / CE-14. Parcelle/planche (journals) → récolte (sessions, sacs, poids, notes, DLUO) → séchage (poids in/out, notes) → transformation/production (poids, notes, y compris par étape de procédé) → produit (poids, notes, n° lot, DLUO). **DLUO** (Q-D1) et **emplacements** (Q-D2) dans le périmètre. |
| D18 | **Transformation = domaine distinct** | La **transformation primaire** (matière → matière : séchage, distillation, mondage…) est une opération **tracée à part**, distincte de la production par recette (assemblage → produit fini). Le séchage frais→sec devient un **événement tracé** (UC-C0), pas une conversion auto. Webhook `transformation déclarée`. |
| D16 | **Culture : Parcelle + Planche, pas d’« espace »** | Pas d'entité espace (Q-E4) : **Parcelle** (lettres + vocation) + **Planche** (numéros, unité opérationnelle, code D6). Images **annotées avant upload** (pas de SIG, Q-E5). Historique **journalier** sur la planche. Données de culture propres au **lot & à l'année** (Q-E7). |
| D17 | **API & webhooks** | **API REST** (Q-G2), **clé d'API** simple (Q-G4). Webhooks **configurables par JSON** `nom.du.hook → [urls]` (Q-G3), chacun **documenté**. Prix matière **historisés** `{date:prix}`, exposés dans l'API (Q-A3). |

---

## ❓ Questions ouvertes — avec proposition de défaut V1

> Défauts proposés pour rester **simple au V1**. À confirmer / corriger.

### Cadrage
| #    | Question                                             | Défaut V1 proposé                                                                                                                                                                |
| ---- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-U1 | Mono ou multi-utilisateur ?                          | **Multi-utilisateur**  auth simple (login, mdp)                                                                                                                                  |
| Q-H1 | Hébergement Hostinger : mutualisé PHP/MySQL ou VPS ? | voir [Guide technique pour développeurs](obsidian://open?vault=le-chaudron-qui-sent-bon-obsidian&file=obsidian%2F98%20-%20WebApp%2FGuide%20technique%20pour%20d%C3%A9veloppeurs) |

### Catalogue (A)
| #    | Question                                         | Défaut V1 proposé                                                                                                        |
| ---- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Q-A1 | Variantes de recette (UC-A2.6)                   | Champ « notes de variante » sur la recette ; pas d'objet variante dédié au V1.                                           |
| Q-A2 | Benchmarks concurrence (UC-A4.4)                 | **Hors V1** (données de veille, pas bloquant pour piloter).                                                              |
| Q-A3 | Historiser les prix matière (UC-A1.6)            | V1 : **dernier prix saisi**. Prix moyen / historique champs visible dans l'API (une liste avec date(YYYY-MM-DD):prix)    |
| Q-A4 | Revente matière brute (UC-A1.7)                  | Modéliser comme **produit** dont la « recette » = matière seule (uniformise le stock/vente). À valider.                  |
| Q-A5 | Unités de recette (UC-A2.2)                      | Supporter **proportions ET quantités absolues** + taille de lot de référence. Non négociable (l'existant a les deux).    |
| Q-A6 | Familles cosmétiques (huile, HE, savon…) au V1 ? | **Modèle générique** dès le V1, mais **données V1 = alimentaire** (épices/sirops/sels/…). Cosmétique alimenté plus tard. |
| Q-A7 | Catégorie réglementaire (UC-A2.1b) au V1 ?       | **Oui, en champ** (simple référence à la fiche régl.) ; contraintes/étiquetage détaillés plus tard.                      |

### Commercial (B)
| #    | Question                                                 | Défaut V1 proposé                                                                                             |
| ---- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Q-B1 | Granularité intentions (UC-B1.1)                         | **Par année civile** (cohérent D2) ; répartition mensuelle plus tard.                                         |
| Q-B2 | Canaux / points de vente (UC-B3)                         | ✅ PdV = **canaux** ; **clients** = fiches + historique (voir D9 / [[B - Commercial (spec)]]). |
| Q-B3 | Ventes marché (UC-B2.4)                                  | **Saisie agrégée** par jour de vente / par produit.<br>Permet de declaer une vente via API                    |
| Q-B4 | Rattacher les **intentions** aussi à un point de vente ? | non                                                                                                           |
| Q-B5 | Taux horaire main d'œuvre (UC-A4.6/D11)                  | Un **taux global** paramétrable et taux par tâche plus tard (si on renseigné conserver la valuer par default) |

### Production (C)
| #    | Question                            | Défaut V1 proposé                                                                                                                                                                                                                        |
| ---- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-C1 | Traçabilité lot (UC-C1.3) | **Parcelle → Planche → Récolte → Séchage → Transformation → Produit** (obligatoire). Séchage = C0 `sechage` ; Transformation = production C1 (+ autres C0 éventuels dans le graphe). |
| Q-C2 | Planifier les productions (UC-C2.3) | **Enregistrer** + suivre l'avancement ; pas d'ordonnancement charge/semaine au V1. |
| Q-C3 | Paramètres transformation (temp., durée…) | ✅ JSON libre optionnel (`temperature_c`, `duree_min`…) — [[C - Production & transformation (spec)]] CC-3. |

### Stock (D)
| #    | Question                           | Défaut V1 proposé             |
| ---- | ---------------------------------- | ----------------------------- |
| Q-D1 | DLUO / péremption (UC-D1.4)        | ✅ **Par lot** (matière + produit) ; alerte seuil jours (paramètre). Voir [[D - Stock (spec)]]. |
| Q-D2 | Emplacements de stockage (UC-D2.5) | ✅ Select + créer ; sacs possibles comme emplacement ou label `numeros_sacs`. |

### Plateforme (G)
| #    | Question                                          | Défaut V1 proposé                                                                                                                                                                                                                                                   |
| ---- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-G1 | Storefront = boutique publique ou front interne ? | ✅ Résolu → D8 : **front de vente interne** au V1.                                                                                                                                                                                                                   |
| Q-G2 | Style d'API : REST                                | **REST** par défaut (simple, bien outillé )                                                                                                                                                                                                                         |
| Q-G3 | Webhooks : rejeu/retry en cas d'échec au V1 ? | ✅ Config JSON event→urls ; payload versionné ; **1 tentative** + log ; **rejeu manuel** ; pas de retry auto V1 — [[G - Plateforme (spec)]] CG-6. |
| Q-G4 | Auth API pour intégrations externes               | Clé d'API simple                                                                                                                                                                                                                                                    |

### Culture (E)
| #    | Question                                                            | Défaut V1 proposé                                                                                                                                                                                                                                                       |
| ---- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-E1 | Itinéraire technique                                                | ✅ Résolu → D4.                                                                                                                                                                                                                                                          |
| Q-E2 | Blocs/planches (UC-E1) | ✅ **Planche** = numéros dans la **Parcelle** (lettres) ; code `SA-01`. Historique **journalier** sur la planche. |
| Q-E3 | Étapes de culture (S/P/R/T/D)                                       | **Personnalisables par espèce** (liste d'étapes ordonnée dans l'itinéraire), avec S/P/R/T/D comme modèles de départ.                                                                                                                                                    |
| Q-E4 | Relation espace ↔ parcelle                                          | Pas d’entité espace. **Parcelle** (lettres + vocation) + **Planche** (numéros).                                                                                                                                                                                          |
| Q-E5 | Géométrie/coordonnées des parcelles                                 | Permettre d'afficher des images (elle serons aonotées avant upload)                                                                                                                                                                                                     |
| Q-E6 | Stockage des images du carrousel parcelle                           | Upload fichiers ; `❓` où (serveur Hostinger / dossier). À cadrer à la spec technique. cf -> [Guide technique pour développeurs](obsidian://open?vault=le-chaudron-qui-sent-bon-obsidian&file=obsidian%2F98%20-%20WebApp%2FGuide%20technique%20pour%20d%C3%A9veloppeurs) |
| Q-E7 | Rendement (t/ha) par espèce pour dériver les surfaces (F)           | **Oui** : attribut espèce, ajustable par lot. Base du calcul surface ↔ volume.<br>Pour chaque culture, conserver toutes les informations dont celle-là (qui ne seront pas les memes par années)                                                                         |
| Q-E8 | Associations de cultures (UC-E2.3) exploitées par la planif au V1 ? | Consignées au V1 (données) ; **alertes/suggestions** automatiques plus tard. Voir [[F - Planification (spec)]] CF-7. |
| Q-E9 | Contrainte eau dans la planif (UC-F1.6) au V1 ?                     | Besoin en eau **affiché/filtrable** au V1 ; arbitrage automatique par budget eau plus tard. CF-6. |
| Q-F1 | Rotations / pérennité (UC-F1.5) | ✅ V1 : vivaces en place + historique planche informatif ; scoring rotation plus tard — CF-8. |

### Transverse (T)
| # | Question | Défaut V1 proposé |
|---|----------|-------------------|
| Q-T1 | Import initial (UC-T3) | **Oui** : import Excel v19 (preview + commit) — [[T - Transverses (spec)]]. |
| Q-T2 | Exports (UC-T5) | Export CSV basique ; étiquettes/compta plus tard. |
| Q-T4 | Journal des modifications (UC-T4) | ✅ AuditLog léger (qui/quand/entité/action/summary) — CT-4. |
| Q-T6 | Sauvegarde / restauration (UC-T6) | ✅ Backup téléchargeable admin ; restore hors UI V1 — CT-6. |

---

## Liens

- [[00 - Cas d'utilisation]]
