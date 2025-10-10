"use client"

import type React from "react"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStopDesks } from "@/contexts/stopdesk-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LogOut, Package } from "lucide-react"
import { WILAYAS } from "@/lib/wilayas"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db, functions } from "@/lib/firebase-config"
import { httpsCallable } from "firebase/functions"
import { doc, getDoc } from "firebase/firestore"

const stationsByWilaya: Record<string, Array<{ id: string; name: string }>> = {
  "1": [
    { id: "ALG001", name: "Alger Centre" },
    { id: "ALG002", name: "Alger Bab Ezzouar" },
  ],
  "31": [
    { id: "ORA001", name: "Oran Es Senia" },
    { id: "ORA002", name: "Oran Centre" },
  ],
  "25": [
    { id: "CON001", name: "Constantine Zouaghi" },
    { id: "CON002", name: "Constantine Centre" },
  ],
  "23": [{ id: "ANN001", name: "Annaba Centre" }],
  "9": [{ id: "BLI001", name: "Blida Centre" }],
  "19": [{ id: "SET001", name: "Sétif Centre" }],
  "5": [{ id: "BAT001", name: "Batna Centre" }],
}

const communesByWilaya: Record<string, string[]> = {
  "1": [
    "Adrar",
    "Tamest",
    "Reggane",
    "Inozghmir",
    "Tit",
    "Tsabit",
    "Zaouiet Kounta",
    "Aoulef",
    "Timokten",
    "Tamentit",
    "Fenoughil",
    "Sali",
    "Akabli",
    "O Ahmed Timmi",
    "Bouda",
    "Sbaa",
  ],
  "2": [
    "Chlef",
    "Tenes",
    "Benairia",
    "El Karimia",
    "Tadjna",
    "Taougrite",
    "Beni Haoua",
    "Sobha",
    "Harchoun",
    "Ouled Fares",
    "Sidi Akacha",
    "Boukadir",
    "Beni Rached",
    "Talassa",
    "Herenfa",
    "Oued Goussine",
    "Dahra",
    "Ouled Abbes",
    "Sendjas",
    "Zeboudja",
    "Oued Sly",
    "Abou El Hassen",
    "El Marsa",
    "Chettia",
    "Sidi Abderrahmane",
    "Moussadek",
    "El Hadjadj",
    "Labiod Medjadja",
    "Oued Fodda",
    "Ouled Ben Abdelkader",
    "Bouzghaia",
    "Ain Merane",
    "Oum Drou",
    "Breira",
    "Ben Boutaleb",
  ],
  "3": [
    "Laghouat",
    "Ksar El Hirane",
    "Benacer Ben Chohra",
    "Sidi Makhlouf",
    "Hassi Delaa",
    "Hassi R Mel",
    "Ain Mahdi",
    "Tadjmout",
    "Kheneg",
    "Gueltat Sidi Saad",
    "Ain Sidi Ali",
    "Beidha",
    "Brida",
    "El Ghicha",
    "Hadj Mechri",
    "Sebgag",
    "Taouiala",
    "Tadjrouna",
    "Aflou",
    "El Assafia",
    "Oued Morra",
    "Oued M Zi",
    "El Haouaita",
    "Sidi Bouzid",
  ],
  "4": [
    "Oum El Bouaghi",
    "Ain Beida",
    "Ainmlila",
    "Behir Chergui",
    "El Amiria",
    "Sigus",
    "El Belala",
    "Ain Babouche",
    "Berriche",
    "Ouled Hamla",
    "Dhala",
    "Ain Kercha",
    "Hanchir Toumghani",
    "El Djazia",
    "Ain Diss",
    "Fkirina",
    "Souk Naamane",
    "Zorg",
    "El Fedjoudj Boughrar",
    "Ouled Zouai",
    "Bir Chouhada",
    "Ksar Sbahi",
    "Oued Nini",
    "Meskiana",
    "Ain Fekroune",
    "Rahia",
    "Ain Zitoun",
    "Ouled Gacem",
    "El Harmilia",
  ],
  "5": [
    "Batna",
    "Ghassira",
    "Maafa",
    "Merouana",
    "Seriana",
    "Menaa",
    "El Madher",
    "Tazoult",
    "Ngaous",
    "Guigba",
    "Inoughissen",
    "Ouyoun El Assafir",
    "Djerma",
    "Bitam",
    "Metkaouak",
    "Arris",
    "Kimmel",
    "Tilatou",
    "Ain Djasser",
    "Ouled Selam",
    "Tigherghar",
    "Ain Yagout",
    "Fesdis",
    "Sefiane",
    "Rahbat",
    "Tighanimine",
    "Lemsane",
    "Ksar Belezma",
    "Seggana",
    "Ichmoul",
    "Foum Toub",
    "Beni Foudhala El Hakania",
    "Oued El Ma",
    "Talkhamt",
    "Bouzina",
    "Chemora",
    "Oued Chaaba",
    "Taxlent",
    "Gosbat",
    "Ouled Aouf",
    "Boumagueur",
    "Barika",
    "Djezzar",
    "Tkout",
    "Ain Touta",
    "Hidoussa",
    "Teniet El Abed",
    "Oued Taga",
    "Ouled Fadel",
    "Timgad",
    "Ras El Aioun",
    "Chir",
    "Ouled Si Slimane",
    "Zanat El Beida",
    "Amdoukal",
    "Ouled Ammar",
    "El Hassi",
    "Lazrou",
    "Boumia",
    "Boulhilat",
    "Larbaa",
  ],
  "6": [
    "Bejaia",
    "Amizour",
    "Ferraoun",
    "Taourirt Ighil",
    "Chelata",
    "Tamokra",
    "Timzrit",
    "Souk El Thenine",
    "Mcisna",
    "Thinabdher",
    "Tichi",
    "Semaoun",
    "Kendira",
    "Tifra",
    "Ighram",
    "Amalou",
    "Ighil Ali",
    "Ifelain Ilmathen",
    "Toudja",
    "Darguina",
    "Sidi Ayad",
    "Aokas",
    "Beni Djellil",
    "Adekar",
    "Akbou",
    "Seddouk",
    "Tazmalt",
    "Ait Rizine",
    "Chemini",
    "Souk Oufella",
    "Taskriout",
    "Tibane",
    "Tala Hamza",
    "Barbacha",
    "Beni Ksila",
    "Ouzallaguen",
    "Bouhamza",
    "Beni Melikeche",
    "Sidi Aich",
    "El Kseur",
    "Melbou",
    "Akfadou",
    "Leflaye",
    "Kherrata",
    "Draa Kaid",
    "Tamridjet",
    "Ait Smail",
    "Ait Smail",
    "Boukhelifa",
    "Tizi Nberber",
    "Beni Maouch",
    "Oued Ghir",
    "Boudjellil",
  ],
  "7": [
    "Biskra",
    "Oumache",
    "Branis",
    "Chetma",
    "Besbes",
    "Sidi Okba",
    "Mchouneche",
    "El Haouch",
    "Ain Naga",
    "Zeribet El Oued",
    "El Feidh",
    "El Kantara",
    "Ain Zaatout",
    "El Outaya",
    "Djemorah",
    "Tolga",
    "Lioua",
    "Lichana",
    "Ourlal",
    "Mlili",
    "Foughala",
    "Bordj Ben Azzouz",
    "Meziraa",
    "Bouchagroun",
    "Mekhadma",
    "El Ghrous",
    "El Hadjab",
    "Khanguet Sidinadji",
  ],
  "8": [
    "Bechar",
    "Erg Ferradj",
    "Meridja",
    "Lahmar",
    "Mechraa Houari B",
    "Kenedsa",
    "Tabalbala",
    "Taghit",
    "Boukais",
    "Mogheul",
    "Abadla",
    "Beni Ounif",
  ],
  "9": [
    "Blida",
    "Chebli",
    "Bouinan",
    "Oued El Alleug",
    "Ouled Yaich",
    "Chrea",
    "El Affroun",
    "Chiffa",
    "Hammam Melouane",
    "Ben Khlil",
    "Soumaa",
    "Mouzaia",
    "Souhane",
    "Meftah",
    "Ouled Selama",
    "Boufarik",
    "Larbaa",
    "Oued Djer",
    "Beni Tamou",
    "Bouarfa",
    "Beni Mered",
    "Bougara",
    "Guerrouaou",
    "Ain Romana",
    "Djebabra",
  ],
  "10": [
    "Bouira",
    "El Asnam",
    "Guerrouma",
    "Souk El Khemis",
    "Kadiria",
    "Hanif",
    "Dirah",
    "Ait Laaziz",
    "Taghzout",
    "Raouraoua",
    "Mezdour",
    "Haizer",
    "Lakhdaria",
    "Maala",
    "El Hachimia",
    "Aomar",
    "Chorfa",
    "Bordj Oukhriss",
    "El Adjiba",
    "El Hakimia",
    "El Khebouzia",
    "Ahl El Ksar",
    "Bouderbala",
    "Zbarbar",
    "Ain El Hadjar",
    "Djebahia",
    "Aghbalou",
    "Taguedit",
    "Ain Turk",
    "Saharidj",
    "Dechmia",
    "Ridane",
    "Bechloul",
    "Boukram",
    "Ain Bessam",
    "Bir Ghbalou",
    "Mchedallah",
    "Sour El Ghozlane",
    "Maamora",
    "Ouled Rached",
    "Ain Laloui",
    "Hadjera Zerga",
    "Ath Mansour",
    "El Mokrani",
    "Oued El Berdi",
  ],
  "11": ["Tamanghasset", "Abalessa", "Idles", "Tazouk", "In Amguel"],
  "12": [
    "Tebessa",
    "Bir El Ater",
    "Cheria",
    "Stah Guentis",
    "El Aouinet",
    "Lahouidjbet",
    "Safsaf El Ouesra",
    "Hammamet",
    "Negrine",
    "Bir El Mokadem",
    "El Kouif",
    "Morsott",
    "El Ogla",
    "Bir Dheheb",
    "El Ogla El Malha",
    "Gorriguer",
    "Bekkaria",
    "Boukhadra",
    "Ouenza",
    "El Ma El Biodh",
    "Oum Ali",
    "Thlidjene",
    "Ain Zerga",
    "El Meridj",
    "Boulhaf Dyr",
    "Bedjene",
    "El Mazeraa",
    "Ferkane",
  ],
  "13": [
    "Tlemcen",
    "Beni Mester",
    "Ain Tallout",
    "Remchi",
    "El Fehoul",
    "Sabra",
    "Ghazaouet",
    "Souani",
    "Djebala",
    "El Gor",
    "Oued Chouly",
    "Ain Fezza",
    "Ouled Mimoun",
    "Amieur",
    "Ain Youcef",
    "Zenata",
    "Beni Snous",
    "Bab El Assa",
    "Dar Yaghmouracene",
    "Fellaoucene",
    "Azails",
    "Sebbaa Chioukh",
    "Terni Beni Hediel",
    "Bensekrane",
    "Ain Nehala",
    "Hennaya",
    "Maghnia",
    "Hammam Boughrara",
    "Souahlia",
    "Msirda Fouaga",
    "Ain Fetah",
    "El Aricha",
    "Souk Thlata",
    "Sidi Abdelli",
    "Sebdou",
    "Beni Ouarsous",
    "Sidi Medjahed",
    "Beni Boussaid",
    "Marsa Ben Mhidi",
    "Nedroma",
    "Sidi Djillali",
    "Beni Bahdel",
    "El Bouihi",
    "Honaine",
    "Tianet",
    "Ouled Riyah",
    "Bouhlou",
    "Souk El Khemis",
    "Ain Ghoraba",
    "Chetouane",
    "Mansourah",
    "Beni Semiel",
    "Ain Kebira",
  ],
  "14": [
    "Tiaret",
    "Medroussa",
    "Ain Bouchekif",
    "Sidi Ali Mellal",
    "Ain Zarit",
    "Ain Deheb",
    "Sidi Bakhti",
    "Medrissa",
    "Zmalet El Emir Aek",
    "Madna",
    "Sebt",
    "Mellakou",
    "Dahmouni",
    "Rahouia",
    "Mahdia",
    "Sougueur",
    "Sidi Abdelghani",
    "Ain El Hadid",
    "Ouled Djerad",
    "Naima",
    "Meghila",
    "Guertoufa",
    "Sidi Hosni",
    "Djillali Ben Amar",
    "Sebaine",
    "Tousnina",
    "Frenda",
    "Ain Kermes",
    "Ksar Chellala",
    "Rechaiga",
    "Nadorah",
    "Tagdemt",
    "Oued Lilli",
    "Mechraa Safa",
    "Hamadia",
    "Chehaima",
    "Takhemaret",
    "Sidi Abderrahmane",
    "Serghine",
    "Bougara",
    "Faidja",
    "Tidda",
  ],
  "15": [
    "Tizi Ouzou",
    "Ain El Hammam",
    "Akbil",
    "Freha",
    "Souamaa",
    "Mechtrass",
    "Irdjen",
    "Timizart",
    "Makouda",
    "Draa El Mizan",
    "Tizi Ghenif",
    "Bounouh",
    "Ait Chaffaa",
    "Frikat",
    "Beni Aissi",
    "Beni Zmenzer",
    "Iferhounene",
    "Azazga",
    "Iloula Oumalou",
    "Yakouren",
    "Larba Nait Irathen",
    "Tizi Rached",
    "Zekri",
    "Ouaguenoun",
    "Ain Zaouia",
    "Mkira",
    "Ait Yahia",
    "Ait Mahmoud",
    "Maatka",
    "Ait Boumehdi",
    "Abi Youcef",
    "Beni Douala",
    "Illilten",
    "Bouzgen",
    "Ait Aggouacha",
    "Ouadhia",
    "Azzefoun",
    "Tigzirt",
    "Ait Smail",
    "Ait Smail",
    "Boghni",
    "Ifigha",
    "Ait Oumalou",
    "Tirmitine",
    "Akerrou",
    "Yatafen",
    "Beni Ziki",
    "Draa Ben Khedda",
    "Ouacif",
    "Idjeur",
    "Mekla",
    "Tizi Nthlata",
    "Beni Yenni",
    "Aghrib",
    "Iflissen",
    "Boudjima",
    "Ait Yahia Moussa",
    "Souk El Thenine",
    "Ait Khelil",
    "Sidi Naamane",
    "Iboudraren",
    "Aghni Goughran",
    "Mizrana",
    "Imsouhal",
    "Tadmait",
    "Ait Bouadou",
    "Assi Youcef",
    "Ait Toudert",
  ],
  "16": [
    "Alger Centre",
    "Sidi Mhamed",
    "El Madania",
    "Hamma Anassers",
    "Bab El Oued",
    "Bologhine Ibn Ziri",
    "Casbah",
    "Oued Koriche",
    "Bir Mourad Rais",
    "El Biar",
    "Bouzareah",
    "Birkhadem",
    "El Harrach",
    "Baraki",
    "Oued Smar",
    "Bourouba",
    "Hussein Dey",
    "Kouba",
    "Bachedjerah",
    "Dar El Beida",
    "Bab Azzouar",
    "Ben Aknoun",
    "Dely Ibrahim",
    "Bains Romains",
    "Rais Hamidou",
    "Djasr Kasentina",
    "El Mouradia",
    "Hydra",
    "Mohammadia",
    "Bordj El Kiffan",
    "El Magharia",
    "Beni Messous",
    "Les Eucalyptus",
    "Birtouta",
    "Tassala El Merdja",
    "Ouled Chebel",
    "Sidi Moussa",
    "Ain Taya",
    "Bordj El Bahri",
    "Marsa",
    "Haraoua",
    "Rouiba",
    "Reghaia",
    "Ain Benian",
    "Staoueli",
    "Zeralda",
    "Mahelma",
    "Rahmania",
    "Souidania",
    "Cheraga",
    "Ouled Fayet",
    "El Achour",
    "Draria",
    "Douera",
    "Baba Hassen",
    "Khracia",
    "Saoula",
  ],
  "17": [
    "Djelfa",
    "Moudjebara",
    "El Guedid",
    "Hassi Bahbah",
    "Ain Maabed",
    "Sed Rahal",
    "Feidh El Botma",
    "Birine",
    "Bouira Lahdeb",
    "Zaccar",
    "El Khemis",
    "Sidi Baizid",
    "Mliliha",
    "El Idrissia",
    "Douis",
    "Hassi El Euch",
    "Messaad",
    "Guettara",
    "Sidi Ladjel",
    "Had Sahary",
    "Guernini",
    "Selmana",
    "Ain Chouhada",
    "Oum Laadham",
    "Dar Chouikh",
    "Charef",
    "Beni Yacoub",
    "Zaafrane",
    "Deldoul",
    "Ain El Ibel",
    "Ain Oussera",
    "Benhar",
    "Hassi Fedoul",
    "Amourah",
    "Ain Fekka",
    "Tadmit",
  ],
  "18": [
    "Jijel",
    "Erraguene",
    "El Aouana",
    "Ziamma Mansouriah",
    "Taher",
    "Emir Abdelkader",
    "Chekfa",
    "Chahna",
    "El Milia",
    "Sidi Maarouf",
    "Settara",
    "El Ancer",
    "Sidi Abdelaziz",
    "Kaous",
    "Ghebala",
    "Bouraoui Belhadef",
    "Djmila",
    "Selma Benziada",
    "Boussif Ouled Askeur",
    "El Kennar Nouchfi",
    "Ouled Yahia Khadrouch",
    "Boudria Beni Yadjis",
    "Kemir Oued Adjoul",
    "Texena",
    "Djemaa Beni Habibi",
    "Bordj Taher",
    "Ouled Rabah",
    "Ouadjana",
  ],
  "19": [
    "Setif",
    "Ain El Kebira",
    "Beni Aziz",
    "Ouled Sidi Ahmed",
    "Boutaleb",
    "Ain Roua",
    "Draa Kebila",
    "Bir El Arch",
    "Beni Chebana",
    "Ouled Tebben",
    "Hamma",
    "Maaouia",
    "Ain Legraj",
    "Ain Abessa",
    "Dehamcha",
    "Babor",
    "Guidjel",
    "Ain Lahdjar",
    "Bousselam",
    "El Eulma",
    "Djemila",
    "Beni Ouartilane",
    "Rosfa",
    "Ouled Addouane",
    "Belaa",
    "Ain Arnat",
    "Amoucha",
    "Ain Oulmane",
    "Beidha Bordj",
    "Bouandas",
    "Bazer Sakhra",
    "Hammam Essokhna",
    "Mezloug",
    "Bir Haddada",
    "Serdj El Ghoul",
    "Harbil",
    "El Ouricia",
    "Tizi Nbechar",
    "Salah Bey",
    "Ain Azal",
    "Guenzet",
    "Talaifacene",
    "Bougaa",
    "Beni Fouda",
    "Tachouda",
    "Beni Mouhli",
    "Ouled Sabor",
    "Guellal",
    "Ain Sebt",
    "Hammam Guergour",
    "Ait Naoual Mezada",
    "Ksar El Abtal",
    "Beni Hocine",
    "Ait Tizi",
    "Maouklane",
    "Guelta Zerka",
    "Oued El Barad",
    "Taya",
    "El Ouldja",
    "Tella",
  ],
  "20": [
    "Saida",
    "Doui Thabet",
    "Ain El Hadjar",
    "Ouled Khaled",
    "Moulay Larbi",
    "Youb",
    "Hounet",
    "Sidi Amar",
    "Sidi Boubekeur",
    "El Hassasna",
    "Maamora",
    "Sidi Ahmed",
    "Ain Sekhouna",
    "Ouled Brahim",
    "Tircine",
    "Ain Soltane",
  ],
  "21": [
    "Skikda",
    "Ain Zouit",
    "El Hadaik",
    "Azzaba",
    "Djendel Saadi Mohamed",
    "Ain Cherchar",
    "Bekkouche Lakhdar",
    "Benazouz",
    "Es Sebt",
    "Collo",
    "Beni Zid",
    "Kerkera",
    "Ouled Attia",
    "Oued Zehour",
    "Zitouna",
    "El Harrouch",
    "Zerdazas",
    "Ouled Hebaba",
    "Sidi Mezghiche",
    "Emdjez Edchich",
    "Beni Oulbane",
    "Ain Bouziane",
    "Ramdane Djamel",
    "Beni Bachir",
    "Salah Bouchaour",
    "Tamalous",
    "Ain Kechra",
    "Oum Toub",
    "Bein El Ouiden",
    "Fil Fila",
    "Cheraia",
    "Kanoua",
    "El Ghedir",
    "Bouchtata",
    "Ouldja Boulbalout",
    "Kheneg Mayoum",
    "Hamadi Krouma",
    "El Marsa",
  ],
  "22": [
    "Sidi Bel Abbes",
    "Tessala",
    "Sidi Brahim",
    "Mostefa Ben Brahim",
    "Telagh",
    "Mezaourou",
    "Boukhanafis",
    "Sidi Ali Boussidi",
    "Badredine El Mokrani",
    "Marhoum",
    "Tafissour",
    "Amarnas",
    "Tilmouni",
    "Sidi Lahcene",
    "Ain Thrid",
    "Makedra",
    "Tenira",
    "Moulay Slissen",
    "El Hacaiba",
    "Hassi Zehana",
    "Tabia",
    "Merine",
    "Ras El Ma",
    "Ain Tindamine",
    "Ain Kada",
    "Mcid",
    "Sidi Khaled",
    "Ain El Berd",
    "Sfissef",
    "Ain Adden",
    "Oued Taourira",
    "Dhaya",
    "Zerouala",
    "Lamtar",
    "Sidi Chaib",
    "Sidi Dahou Dezairs",
    "Oued Sbaa",
    "Boudjebaa El Bordj",
    "Sehala Thaoura",
    "Sidi Yacoub",
    "Sidi Hamadouche",
    "Belarbi",
    "Oued Sefioun",
    "Teghalimet",
    "Ben Badis",
    "Sidi Ali Benyoub",
    "Chetouane Belaila",
    "Bir El Hammam",
    "Taoudmout",
    "Redjem Demouche",
    "Benachiba Chelia",
    "Hassi Dahou",
  ],
  "23": [
    "Annaba",
    "Berrahel",
    "El Hadjar",
    "Eulma",
    "El Bouni",
    "Oued El Aneb",
    "Cheurfa",
    "Seraidi",
    "Ain Berda",
    "Chetaibi",
    "Sidi Amer",
    "Treat",
  ],
  "24": [
    "Guelma",
    "Nechmaya",
    "Bouati Mahmoud",
    "Oued Zenati",
    "Tamlouka",
    "Oued Fragha",
    "Ain Sandel",
    "Ras El Agba",
    "Dahouara",
    "Belkhir",
    "Ben Djarah",
    "Bou Hamdane",
    "Ain Makhlouf",
    "Ain Ben Beida",
    "Khezara",
    "Beni Mezline",
    "Bou Hachana",
    "Guelaat Bou Sbaa",
    "Hammam Maskhoutine",
    "El Fedjoudj",
    "Bordj Sabat",
    "Hamman Nbail",
    "Ain Larbi",
    "Medjez Amar",
    "Bouchegouf",
    "Heliopolis",
    "Ain Hessania",
    "Roknia",
    "Salaoua Announa",
    "Medjez Sfa",
    "Boumahra Ahmed",
    "Ain Reggada",
    "Oued Cheham",
    "Djeballah Khemissi",
  ],
  "25": [
    "Constantine",
    "Hamma Bouziane",
    "El Haria",
    "Zighoud Youcef",
    "Didouche Mourad",
    "El Khroub",
    "Ain Abid",
    "Beni Hamiden",
    "Ouled Rahmoune",
    "Ain Smara",
    "Mesaoud Boudjeriou",
    "Ibn Ziad",
  ],
  "26": [
    "Medea",
    "Ouzera",
    "Ouled Maaref",
    "Ain Boucif",
    "Aissaouia",
    "Ouled Deide",
    "El Omaria",
    "Derrag",
    "El Guelbelkebir",
    "Bouaiche",
    "Mezerena",
    "Ouled Brahim",
    "Damiat",
    "Sidi Ziane",
    "Tamesguida",
    "El Hamdania",
    "Kef Lakhdar",
    "Chelalet El Adhaoura",
    "Bouskene",
    "Rebaia",
    "Bouchrahil",
    "Ouled Hellal",
    "Tafraout",
    "Baata",
    "Boghar",
    "Sidi Naamane",
    "Ouled Bouachra",
    "Sidi Zahar",
    "Oued Harbil",
    "Benchicao",
    "Sidi Damed",
    "Aziz",
    "Souagui",
    "Zoubiria",
    "Ksar El Boukhari",
    "El Azizia",
    "Djouab",
    "Chahbounia",
    "Meghraoua",
    "Cheniguel",
    "Ain Ouksir",
    "Oum El Djalil",
    "Ouamri",
    "Si Mahdjoub",
    "Tlatet Eddoair",
    "Beni Slimane",
    "Berrouaghia",
    "Seghouane",
    "Meftaha",
    "Mihoub",
    "Boughezoul",
    "Tablat",
    "Deux Bassins",
    "Draa Essamar",
    "Sidi Errabia",
    "Bir Ben Laabed",
    "El Ouinet",
    "Ouled Antar",
    "Bouaichoune",
    "Hannacha",
    "Sedraia",
    "Medjebar",
    "Khams Djouamaa",
    "Saneg",
  ],
  "27": [
    "Mostaganem",
    "Sayada",
    "Fornaka",
    "Stidia",
    "Ain Nouissy",
    "Hassi Maameche",
    "Ain Tadles",
    "Sour",
    "Oued El Kheir",
    "Sidi Bellater",
    "Kheiredine ",
    "Sidi Ali",
    "Abdelmalek Ramdane",
    "Hadjadj",
    "Nekmaria",
    "Sidi Lakhdar",
    "Achaacha",
    "Khadra",
    "Bouguirat",
    "Sirat",
    "Ain Sidi Cherif",
    "Mesra",
    "Mansourah",
    "Souaflia",
    "Ouled Boughalem",
    "Ouled Maallah",
    "Mezghrane",
    "Ain Boudinar",
    "Tazgait",
    "Safsaf",
    "Touahria",
    "El Hassiane",
  ],
  "28": [
    "Msila",
    "Maadid",
    "Hammam Dhalaa",
    "Ouled Derradj",
    "Tarmount",
    "Mtarfa",
    "Khoubana",
    "Mcif",
    "Chellal",
    "Ouled Madhi",
    "Magra",
    "Berhoum",
    "Ain Khadra",
    "Ouled Addi Guebala",
    "Belaiba",
    "Sidi Aissa",
    "Ain El Hadjel",
    "Sidi Hadjeres",
    "Ouanougha",
    "Bou Saada",
    "Ouled Sidi Brahim",
    "Sidi Ameur",
    "Tamsa",
    "Ben Srour",
    "Ouled Slimane",
    "El Houamed",
    "El Hamel",
    "Ouled Mansour",
    "Maarif",
    "Dehahna",
    "Bouti Sayah",
    "Khettouti Sed Djir",
    "Zarzour",
    "Oued Chair",
    "Benzouh",
    "Bir Foda",
    "Ain Fares",
    "Sidi Mhamed",
    "Ouled Atia",
    "Souamaa",
    "Ain El Melh",
    "Medjedel",
    "Slim",
    "Ain Errich",
    "Beni Ilmane",
    "Oultene",
    "Djebel Messaad",
  ],
  "29": [
    "Mascara",
    "Bou Hanifia",
    "Tizi",
    "Hacine",
    "Maoussa",
    "Teghennif",
    "El Hachem",
    "Sidi Kada",
    "Zelmata",
    "Oued El Abtal",
    "Ain Ferah",
    "Ghriss",
    "Froha",
    "Matemore",
    "Makdha",
    "Sidi Boussaid",
    "El Bordj",
    "Ain Fekan",
    "Benian",
    "Khalouia",
    "El Menaouer",
    "Oued Taria",
    "Aouf",
    "Ain Fares",
    "Ain Frass",
    "Sig",
    "Oggaz",
    "Alaimia",
    "El Gaada",
    "Zahana",
    "Mohammadia",
    "Sidi Abdelmoumene",
    "Ferraguig",
    "El Ghomri",
    "Sedjerara",
    "Moctadouz",
    "Bou Henni",
    "Guettena",
    "El Keurt",
    "Gharrous",
    "Gherdjoum",
    "Chorfa",
    "Ras Ain Amirouche",
    "Nesmot",
    "Sidi Abdeldjebar",
    "Sehailia",
  ],
  "30": [
    "Ouargla",
    "Ain Beida",
    "Ngoussa",
    "Hassi Messaoud",
    "Rouissat",
    "Sidi Khouiled",
    "Hassi Ben Abdellah",
    "El Borma",
  ],
  "31": [
    "Oran",
    "Gdyel",
    "Bir El Djir",
    "Hassi Bounif",
    "Es Senia",
    "Arzew",
    "Bethioua",
    "Marsat El Hadjadj",
    "Ain Turk",
    "El Ancar",
    "Oued Tlelat",
    "Tafraoui",
    "Sidi Chami",
    "Boufatis",
    "Mers El Kebir",
    "Bousfer",
    "El Karma",
    "El Braya",
    "Hassi Ben Okba",
    "Ben Freha",
    "Hassi Mefsoukh",
    "Sidi Ben Yabka",
    "Messerghin",
    "Boutlelis",
    "Ain Kerma",
    "Ain Biya",
  ],
  "32": [
    "El Bayadh",
    "Rogassa",
    "Stitten",
    "Brezina",
    "Ghassoul",
    "Boualem",
    "El Abiodh Sidi Cheikh",
    "Ain El Orak",
    "Arbaouat",
    "Bougtoub",
    "El Kheither",
    "Kef El Ahmar",
    "Boussemghoun",
    "Chellala",
    "Krakda",
    "El Bnoud",
    "Cheguig",
    "Sidi Ameur",
    "El Mehara",
    "Tousmouline",
    "Sidi Slimane",
    "Sidi Tifour",
  ],
  "33": ["Illizi", "Debdeb", "Bordj Omar Driss", "In Amenas"],
  "34": [
    "Bordj Bou Arreridj",
    "Ras El Oued",
    "Bordj Zemoura",
    "Mansoura",
    "El Mhir",
    "Ben Daoud",
    "El Achir",
    "Ain Taghrout",
    "Bordj Ghdir",
    "Sidi Embarek",
    "El Hamadia",
    "Belimour",
    "Medjana",
    "Teniet En Nasr",
    "Djaafra",
    "El Main",
    "Ouled Brahem",
    "Ouled Dahmane",
    "Hasnaoua",
    "Khelil",
    "Taglait",
    "Ksour",
    "Ouled Sidi Brahim",
    "Tafreg",
    "Colla",
    "Tixter",
    "El Ach",
    "El Anseur",
    "Tesmart",
    "Ain Tesra",
    "Bir Kasdali",
    "Ghilassa",
    "Rabta",
    "Haraza",
  ],
  "35": [
    "Boumerdes",
    "Boudouaou",
    "Afir",
    "Bordj Menaiel",
    "Baghlia",
    "Sidi Daoud",
    "Naciria",
    "Djinet",
    "Isser",
    "Zemmouri",
    "Si Mustapha",
    "Tidjelabine",
    "Chabet El Ameur",
    "Thenia",
    "Timezrit",
    "Corso",
    "Ouled Moussa",
    "Larbatache",
    "Bouzegza Keddara",
    "Taourga",
    "Ouled Aissa",
    "Ben Choud",
    "Dellys",
    "Ammal",
    "Beni Amrane",
    "Souk El Had",
    "Boudouaou El Bahri",
    "Ouled Hedadj",
    "Laghata",
    "Hammedi",
    "Khemis El Khechna",
    "El Kharrouba",
  ],
  "36": [
    "El Tarf",
    "Bouhadjar",
    "Ben Mhidi",
    "Bougous",
    "El Kala",
    "Ain El Assel",
    "El Aioun",
    "Bouteldja",
    "Souarekh",
    "Berrihane",
    "Lac Des Oiseaux",
    "Chefia",
    "Drean",
    "Chihani",
    "Chebaita Mokhtar",
    "Asfour",
    "Echatt",
    "Zerizer",
    "Zitouna",
    "Ain Kerma",
    "Oued Zitoun",
    "Hammam Beni Salah",
    "Raml Souk",
  ],
  "37": ["Tindouf", "Oum El Assel"],
  "38": [
    "Tissemsilt",
    "Bordj Bou Naama",
    "Theniet El Had",
    "Lazharia",
    "Beni Chaib",
    "Lardjem",
    "Melaab",
    "Sidi Lantri",
    "Bordj El Emir Abdelkader",
    "Layoune",
    "Khemisti",
    "Ouled Bessem",
    "Ammari",
    "Youssoufia",
    "Sidi Boutouchent",
    "Larbaa",
    "Maasem",
    "Sidi Abed",
    "Tamalaht",
    "Sidi Slimane",
    "Boucaid",
    "Beni Lahcene",
  ],
  "39": [
    "El Oued",
    "Robbah",
    "Oued El Alenda",
    "Bayadha",
    "Nakhla",
    "Guemar",
    "Kouinine",
    "Reguiba",
    "Hamraia",
    "Taghzout",
    "Debila",
    "Hassani Abdelkrim",
    "Hassi Khelifa",
    "Taleb Larbi",
    "Douar El Ma",
    "Sidi Aoun",
    "Trifaoui",
    "Magrane",
    "Beni Guecha",
    "Ourmas",
    "El Ogla",
    "Mih Ouansa",
  ],
  "40": [
    "Khenchela",
    "Mtoussa",
    "Kais",
    "Baghai",
    "El Hamma",
    "Ain Touila",
    "Taouzianat",
    "Bouhmama",
    "El Oueldja",
    "Remila",
    "Cherchar",
    "Djellal",
    "Babar",
    "Tamza",
    "Ensigha",
    "Ouled Rechache",
    "El Mahmal",
    "Msara",
    "Yabous",
    "Khirane",
    "Chelia",
  ],
  "41": [
    "Souk Ahras",
    "Sedrata",
    "Hanancha",
    "Mechroha",
    "Ouled Driss",
    "Tiffech",
    "Zaarouria",
    "Taoura",
    "Drea",
    "Haddada",
    "Khedara",
    "Merahna",
    "Ouled Moumen",
    "Bir Bouhouche",
    "Mdaourouche",
    "Oum El Adhaim",
    "Ain Zana",
    "Ain Soltane",
    "Quillen",
    "Sidi Fredj",
    "Safel El Ouiden",
    "Ragouba",
    "Khemissa",
    "Oued Keberit",
    "Terraguelt",
    "Zouabi",
  ],
  "42": [
    "Tipaza",
    "Menaceur",
    "Larhat",
    "Douaouda",
    "Bourkika",
    "Khemisti",
    "Aghabal",
    "Hadjout",
    "Sidi Amar",
    "Gouraya",
    "Nodor",
    "Chaiba",
    "Ain Tagourait",
    "Cherchel",
    "Damous",
    "Meurad",
    "Fouka",
    "Bou Ismail",
    "Ahmer El Ain",
    "Bou Haroun",
    "Sidi Ghiles",
    "Messelmoun",
    "Sidi Rached",
    "Kolea",
    "Attatba",
    "Sidi Semiane",
    "Beni Milleuk",
    "Hadjerat Ennous",
  ],
  "43": [
    "Mila",
    "Ferdjioua",
    "Chelghoum Laid",
    "Oued Athmenia",
    "Ain Mellouk",
    "Telerghma",
    "Oued Seguen",
    "Tadjenanet",
    "Benyahia Abderrahmane",
    "Oued Endja",
    "Ahmed Rachedi",
    "Ouled Khalouf",
    "Tiberguent",
    "Bouhatem",
    "Rouached",
    "Tessala Lamatai",
    "Grarem Gouga",
    "Sidi Merouane",
    "Tassadane Haddada",
    "Derradji Bousselah",
    "Minar Zarza",
    "Amira Arras",
    "Terrai Bainen",
    "Hamala",
    "Ain Tine",
    "El Mechira",
    "Sidi Khelifa",
    "Zeghaia",
    "Elayadi Barbes",
    "Ain Beida Harriche",
    "Yahia Beniguecha",
    "Chigara",
  ],
  "44": [
    "Ain Defla",
    "Miliana",
    "Boumedfaa",
    "Khemis Miliana",
    "Hammam Righa",
    "Arib",
    "Djelida",
    "El Amra",
    "Bourached",
    "El Attaf",
    "El Abadia",
    "Djendel",
    "Oued Chorfa",
    "Ain Lechiakh",
    "Oued Djemaa",
    "Rouina",
    "Zeddine",
    "El Hassania",
    "Bir Ouled Khelifa",
    "Ain Soltane",
    "Tarik Ibn Ziad",
    "Bordj Emir Khaled",
    "Ain Torki",
    "Sidi Lakhdar",
    "Ben Allal",
    "Ain Benian",
    "Hoceinia",
    "Barbouche",
    "Djemaa Ouled Chikh",
    "Mekhatria",
    "Bathia",
    "Tachta Zegagha",
    "Ain Bouyahia",
    "El Maine",
    "Tiberkanine",
    "Belaas",
  ],
  "45": [
    "Naama",
    "Mechria",
    "Ain Sefra",
    "Tiout",
    "Sfissifa",
    "Moghrar",
    "Assela",
    "Djeniane Bourzeg",
    "Ain Ben Khelil",
    "Makman Ben Amer",
    "Kasdir",
    "El Biod",
  ],
  "46": [
    "Ain Temouchent",
    "Chaabet El Ham",
    "Ain Kihal",
    "Hammam Bouhadjar",
    "Bou Zedjar",
    "Oued Berkeche",
    "Aghlal",
    "Terga",
    "Ain El Arbaa",
    "Tamzoura",
    "Chentouf",
    "Sidi Ben Adda",
    "Aoubellil",
    "El Malah",
    "Sidi Boumediene",
    "Oued Sabah",
    "Ouled Boudjemaa",
    "Ain Tolba",
    "El Amria",
    "Hassi El Ghella",
    "Hassasna",
    "Ouled Kihal",
    "Beni Saf",
    "Sidi Safi",
    "Oulhaca El Gheraba",
    "Tadmaya",
    "El Emir Abdelkader",
    "El Messaid",
  ],
  "47": [
    "Ghardaia",
    "Dhayet Bendhahoua",
    "Berriane",
    "Metlili",
    "El Guerrara",
    "El Atteuf",
    "Zelfana",
    "Sebseb",
    "Bounoura",
    "Mansoura",
  ],
  "48": [
    "Relizane",
    "Oued Rhiou",
    "Belaassel Bouzegza",
    "Sidi Saada",
    "Ouled Aiche",
    "Sidi Lazreg",
    "El Hamadna",
    "Sidi Mhamed Ben Ali",
    "Mediouna",
    "Sidi Khettab",
    "Ammi Moussa",
    "Zemmoura",
    "Beni Dergoun",
    "Djidiouia",
    "El Guettar",
    "Hamri",
    "El Matmar",
    "Sidi Mhamed Ben Aouda",
    "Ain Tarek",
    "Oued Essalem",
    "Ouarizane",
    "Mazouna",
    "Kalaa",
    "Ain Rahma",
    "Yellel",
    "Oued El Djemaa",
    "Ramka",
    "Mendes",
    "Lahlef",
    "Beni Zentis",
    "Souk El Haad",
    "Dar Ben Abdellah",
    "El Hassi",
    "Had Echkalla",
    "Bendaoud",
    "El Ouldja",
    "Merdja Sidi Abed",
    "Ouled Sidi Mihoub",
  ],
  "49": [
    "Charouine",
    "Ouled Aissa",
    "Talmine",
    "Ouled Said",
    "Timimoun",
    "Ksar Kaddour",
    "Tinerkouk",
    "Deldoul",
    "Metarfa",
    "Aougrout",
  ],
  "50": ["Bordj Badji Mokhtar", "Timiaouine"],
  "51": ["Chaiba", "Doucen", "Ouled Djellal", "Besbes", "Ras El Miad", "Sidi Khaled"],
  "52": ["Ksabi", "Ouled-Khodeir", "Beni Abbes", "Tamtert", "Igli", "El Ouata", "Beni-Ikhlef", "Kerzaz", "Timoudi"],
  "53": ["Inghar", "Ain Salah", "Foggaret Ezzoua"],
  "54": ["Ain Guezzam", "Tin Zouatine"],
  "55": [
    "Nezla",
    "Tebesbest",
    "Touggourt",
    "Zaouia El Abidia",
    "El Alia",
    "El-Hadjira",
    "Benaceur",
    "M'naguer",
    "Taibet",
    "Blidet Amor",
    "Temacine",
    "Megarine",
    "Sidi Slimane",
  ],
  "56": ["Bordj El Haouass", "Djanet"],
  "57": ["El M'Ghair", "Oum Touyour", "Sidi Khelil", "Still", "Djamaa", "M'rara", "Sidi Amrane", "Tenedla"],
  "58": ["El Meniaa", "Hassi Gara", "Hassi Fehal"],
}

interface FormData {
  reference: string
  client: string
  phone: string
  phone_2: string
  adresse: string
  wilaya_id: string
  commune: string
  montant: string
  remarque: string
  produit: string
  type_id: string
  poids: string
  stop_desk: string
  station_code: string
  stock: string
  quantite: string
  can_open: string
  remboursement: string
}

const initialFormData: FormData = {
  reference: "",
  client: "",
  phone: "",
  phone_2: "",
  adresse: "",
  wilaya_id: "",
  commune: "",
  montant: "",
  remarque: "",
  produit: "",
  type_id: "",
  poids: "",
  stop_desk: "0",
  station_code: "",
  stock: "0",
  quantite: "",
  can_open: "0",
  remboursement: "0",
}
type ShopData = {
  id: string;
  noestApiKey?: string;    // encrypted
  noestApiToken?: string;  // encrypted
  name?: string;
  // add anything else you need
};

export default function ParcelForm() {
  const router = useRouter()
  const [shop, setShop] = useState<ShopData | null>(null);
  const [shopLoading, setShopLoading] = useState(true);
  const { loading: stopDesksLoading, getStopDesksByWilaya, getStopDesksByWilayaAndCommune } = useStopDesks()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setShopLoading(true);
      try {
        if (!user) {
          setShop(null);
          return;
        }


          const snap = await getDoc(doc(db, "Shops", user.uid));
          if (snap.exists()) {
            const data = { id: snap.id, ...(snap.data() as any) };
            setShop(data);
            // optional small mirror (encrypted values stay encrypted)
            localStorage.setItem("noest_apiKey_enc", data.apiKey || "");
            localStorage.setItem("noest_apiToken_enc", data.apiToken|| "");
            return;
          }
        
      } catch (e) {
        console.error("[ParcelForm] load shop error:", e);
        setShop(null);
      } finally {
        setShopLoading(false);
      }
    });

    return () => unsub();
  }, []);
  const handleLogout = useCallback(async () => {
    try {
      // Firebase logout
      await signOut(auth);
      console.log("[auth] Firebase sign-out successful");
  
      // Clear local storage
      localStorage.removeItem("api_token");
      localStorage.removeItem("user_guid");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_uid");
      localStorage.removeItem("id_token");
      localStorage.removeItem("isAuthenticated");
  
      // Redirect
      router.push("/");
    } catch (error) {
      console.error("[auth] Logout error:", error);
    }
  }, [router]);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleWilayaChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      wilaya_id: value,
      commune: "", // Reset commune when wilaya changes
      station_code: "", // Reset station when wilaya changes
    }))
  }, [])
  type SubmitEvent = React.FormEvent<HTMLFormElement>;
//console.log(formData?.station_code);

  const handleSubmit = useCallback(
    async (e: SubmitEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");
  
      try {
        // Ensure user is logged in (onCall sends the ID token automatically)
        if (!auth.currentUser) {
          setErrorMessage("Veuillez vous connecter / يرجى تسجيل الدخول");
          setIsSubmitting(false);
          return;
        }
  
        // 1) Build the parcel object from your form (same fields you used before)
        const parcel = {
          reference: formData.reference,
          client: formData.client,
          phone: formData.phone,
          phone_2: formData.phone_2,
          adresse: formData.adresse,
          wilaya_id: Number(formData.wilaya_id),
          commune: formData.commune,
          montant: Number(formData.montant),
          remarque: formData.remarque,
          produit: formData.produit,
          type_id: Number(formData.type_id),
          poids: Number(formData.poids),
          stop_desk: Number(formData.stop_desk),
          stock: Number(formData.stock),
          can_open: Number(formData.can_open),
          remboursement: Number(formData.remboursement),
          ...(formData.stock === "1" && { quantite: Number(formData.quantite) }),
          ...(formData.stop_desk === "1" && { station_code: formData.station_code }),
        };
  
        // 2) Get encrypted Noest creds + shopId (example: from localStorage or your app state)
        //    These MUST be the encrypted strings (do NOT encrypt on the client with AUTH_KEY).
        const apiKeyEnc = shop.apiKey;   // e.g. stored when user connects Noest
        const apiTokenEnc =shop.apiToken;
        const shopId = shop.id;               // or from your state/context
  
        if (!apiKeyEnc || !apiTokenEnc || !shopId) {
          setErrorMessage("Identifiants Noest ou shopId manquants / بيانات Noest أو المعرّف مفقودة");
          setIsSubmitting(false);
          return;
        }
  
        // 3) Call the Cloud Function
        
        const uploadNoestParcel = httpsCallable(functions, "uploadNoestParcel");
  
        console.log("[onCall] uploadNoestParcel payload:", { parcel, shopId });
  console.log(apiKeyEnc);
  
        const res = await uploadNoestParcel({
          parcel,
          apiKey: shop.apiKey,
          apiToken:shop.apiToken,
          shopId:shop?.id,
        });
  
        const result: any = res?.data;
        console.log("[onCall] uploadNoestParcel result:", result);
  
        if (result?.success) {
          setSuccessMessage("Colis enregistré avec succès! / تم تسجيل الطرد بنجاح!");
          setFormData(initialFormData);
          // Optionally show tracking info returned by the function
          // console.log("trackingId:", result.trackingId, "trackingCode:", result.trackingCode);
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          setErrorMessage(
            result?.message || "Erreur lors de l'enregistrement / خطأ في التسجيل"
          );
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (err: any) {
        // HttpsError from onCall shows up as a normal Error with message/code
        console.error("[onCall] uploadNoestParcel error:", err?.code, err?.message);
        setErrorMessage(
          err?.message || "Erreur de connexion au serveur / خطأ في الاتصال بالخادم"
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData]
  );
  
  const showStationCode = useMemo(() => formData.stop_desk === "1", [formData.stop_desk])
  const showQuantite = useMemo(() => formData.stock === "1", [formData.stock])

  const availableCommunes = useMemo(() => {
    if (!formData.wilaya_id) return []
    return communesByWilaya[formData.wilaya_id] || []
  }, [formData.wilaya_id])

  const availableStations = useMemo(() => {
    if (!formData.wilaya_id) return []

    // If commune is selected, filter by both wilaya and commune
    if (formData.commune) {
      return getStopDesksByWilayaAndCommune(Number(formData.wilaya_id), formData.commune)
    }

    // Otherwise, just filter by wilaya
    return getStopDesksByWilaya(Number(formData.wilaya_id))
  }, [formData.wilaya_id, formData.commune, getStopDesksByWilaya, getStopDesksByWilayaAndCommune])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-indigo-900">Noest Parcels</h1>
              <p className="text-sm text-muted-foreground">Gestion des colis / إدارة الطرود</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center font-medium">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center font-medium">
            {errorMessage}
          </div>
        )}

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardTitle className="text-xl">Ajouter une commande / إضافة طلب</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reference">Référence / المرجع</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => handleInputChange("reference", e.target.value)}
                  maxLength={255}
                  placeholder="Référence de la commande"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client" className="flex items-center gap-1">
                  Client / العميل
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => handleInputChange("client", e.target.value)}
                  maxLength={255}
                  required
                  placeholder="Nom du client"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    Téléphone / الهاتف
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    placeholder="0XXXXXXXXX"
                    pattern="[0-9]{9,10}"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_2">Téléphone 2 / الهاتف 2</Label>
                  <Input
                    id="phone_2"
                    type="tel"
                    value={formData.phone_2}
                    onChange={(e) => handleInputChange("phone_2", e.target.value)}
                    placeholder="0XXXXXXXXX"
                    pattern="[0-9]{9,10}"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse" className="flex items-center gap-1">
                  Adresse / العنوان
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => handleInputChange("adresse", e.target.value)}
                  maxLength={255}
                  required
                  placeholder="Adresse complète du client"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wilaya_id" className="flex items-center gap-1">
                    Wilaya / الولاية
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.wilaya_id} onValueChange={handleWilayaChange} required>
                    <SelectTrigger id="wilaya_id">
                      <SelectValue placeholder="Sélectionner une wilaya" />
                    </SelectTrigger>
                    <SelectContent>
                      {WILAYAS.map((wilaya) => (
                        <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                          {wilaya.id} - {wilaya.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commune" className="flex items-center gap-1">
                    Commune / البلدية
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.commune}
                    onValueChange={(value) => handleInputChange("commune", value)}
                    required
                    disabled={!formData.wilaya_id}
                  >
                    <SelectTrigger id="commune">
                      <SelectValue
                        placeholder={
                          formData.wilaya_id ? "Sélectionner une commune" : "Sélectionner d'abord une wilaya"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCommunes.map((commune) => (
                        <SelectItem key={commune} value={commune}>
                          {commune}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="montant" className="flex items-center gap-1">
                  Montant / المبلغ
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="montant"
                  type="number"
                  step="0.01"
                  value={formData.montant}
                  onChange={(e) => handleInputChange("montant", e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="produit" className="flex items-center gap-1">
                  Produit / المنتج
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="produit"
                  value={formData.produit}
                  onChange={(e) => handleInputChange("produit", e.target.value)}
                  required
                  placeholder="Nom du produit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarque">Remarque / ملاحظة</Label>
                <Textarea
                  id="remarque"
                  value={formData.remarque}
                  onChange={(e) => handleInputChange("remarque", e.target.value)}
                  maxLength={255}
                  placeholder="Remarques supplémentaires"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type_id" className="flex items-center gap-1">
                    Type / النوع
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type_id}
                    onValueChange={(value) => handleInputChange("type_id", value)}
                    required
                  >
                    <SelectTrigger id="type_id">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Livraison</SelectItem>
                      <SelectItem value="2">2 - Échange</SelectItem>
                      <SelectItem value="3">3 - Pick up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poids" className="flex items-center gap-1">
                    Poids (kg) / الوزن
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="poids"
                    type="number"
                    value={formData.poids}
                    onChange={(e) => handleInputChange("poids", e.target.value)}
                    required
                    placeholder="Poids en kg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stop_desk" className="flex items-center gap-1">
                  Stop Desk / مكتب التوقف
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.stop_desk}
                  onValueChange={(value) => handleInputChange("stop_desk", value)}
                  required
                >
                  <SelectTrigger id="stop_desk">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Non</SelectItem>
                    <SelectItem value="1">1 - Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showStationCode && (
                <div className="space-y-2">
                  <Label htmlFor="station_code" className="flex items-center gap-1">
                    Code Station / رمز المحطة
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.station_code}
                    onValueChange={(value) => handleInputChange("station_code", value)}
                    required={showStationCode}
                    disabled={!formData.wilaya_id || stopDesksLoading}
                  >
                    <SelectTrigger id="station_code">
                      <SelectValue
                        placeholder={
                          stopDesksLoading
                            ? "Chargement..."
                            : formData.wilaya_id
                              ? availableStations.length > 0
                                ? "Sélectionner une station"
                                : "Aucune station disponible"
                              : "Sélectionner d'abord une wilaya"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStations.map((station) => (
                        <SelectItem key={station.code} value={station.code}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="stock">Stock / المخزون</Label>
                <Select value={formData.stock} onValueChange={(value) => handleInputChange("stock", value)}>
                  <SelectTrigger id="stock">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Non</SelectItem>
                    <SelectItem value="1">1 - Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showQuantite && (
                <div className="space-y-2">
                  <Label htmlFor="quantite" className="flex items-center gap-1">
                    Quantité / الكمية
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantite"
                    type="number"
                    value={formData.quantite}
                    onChange={(e) => handleInputChange("quantite", e.target.value)}
                    required={showQuantite}
                    placeholder="Quantité"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="can_open">Peut ouvrir / يمكن الفتح</Label>
                <Select value={formData.can_open} onValueChange={(value) => handleInputChange("can_open", value)}>
                  <SelectTrigger id="can_open">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Non</SelectItem>
                    <SelectItem value="1">1 - Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remboursement">Remboursement / استرداد</Label>
                <Select
                  value={formData.remboursement}
                  onValueChange={(value) => handleInputChange("remboursement", value)}
                >
                  <SelectTrigger id="remboursement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Non</SelectItem>
                    <SelectItem value="1">1 - Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isSubmitting}>
                  {isSubmitting ? "Enregistrement..." : "Enregistrer le colis / حفظ الطرد"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
