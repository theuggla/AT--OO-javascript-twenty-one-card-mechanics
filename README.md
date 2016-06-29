# <i class="fa fa-graduation-cap"></i> Tjugoett
<ul class="fa-ul fa-border exercise-info">
  <li><i class="fa-li fa fa-star-o"></i>Examinationsuppgift 3</li>
  <li><i class="fa-li fa fa-github"></i><a href="https://github.com/1dv021/examination-3.git">https://github.com/1dv021/examination-3.git</a></li>
</ul>

><i class="fa fa-warning"></i> __VIKTIGT!__ Innan du börjar arbeta med examinationsuppgiften är det viktigt att du lägger till examinationsuppgiftens repo till ditt repo för examinationsuppgiften.

***
### <i class="fa fa-warning"></i> OBS! OBS! OBS!
- Detta är en **obligatorisk** och **examinerande** uppgift som **du ska lösa helt på egen hand**.
- Du måste göra **regelbundna "commits" och "pushes"** av koden till ditt repo för uppgiften för att kursledningen ska kunna följa ditt arbetet med uppgiften.
- Du ska kunna förklara alla konstruktioner och satser som din lösning av uppgiften innehåller.  

***

## <i class="fa fa-flag-o"></i> Introduktion
I denna examinationsuppgift ska du simulera kortspelet Tjugoett enligt givna regler.

Du kommer att ha stor frihet välja hur du vill lösa uppgiften; vilka konstruktioner att använda. Hur representeras lämpligen en kortlek om 52 kort? Behöver data kapslas in så att "getters" och "setter" behövs? Hur många egendefinierade typer behöver skapas? Är arv lämpligt att använda i något sammanhang? Vilka prototypmetoder behövs? Ska metoderna tillhöra prototypobjektet eller inte? Överskuggning?

## <i class="fa fa-flag-o"></i> Regler

### Kort
En vanlig kortlek om 52 kort används. Esset är värt 1 eller 14 poäng, en kung är värd 13, en dam 12, en knekt 11 och övriga kort sin valör.

### Spelet idé
I Tjugoett gäller det att komma till, eller så nära som möjligt, summan 21 på två eller flera kort. 

### Exempel
Given ger alla spelare ett kort var från draghögen. Given tar inte själv något kort. Spelarna spelar nu mot given en i taget i turordning. När det är en spelares tur begär spelaren ett kort av given. För de följande korten spelaren begär kan något av följande inträffa:

1. Spelaren har fått 21 och vinner.
2. Spelaren har spruckit, d.v.s. fått en summa större än 21, och förlorar.
3. Spelaren begär ytterligare kort tills summan är 21, större än 21 eller förklarar sig nöjd.
4. Spelaren har efter fem kort fortfarande en summa mindre än 21 och vinner.

Då en spelare förklarat sig nöjd är det givens tur att försöka straffa spelaren. Given drar kort från draghögen, ett efter ett, och något av följande kan inträffa:

1. Given får 21 och vinner.
2. Given spricker och spelaren vinner.
3. Given förklarar sig nöjd om summorna är lika eller om givens summa är högre. Given vinner då.

Given fortsätter sedan att spela mot näste spelare på samma sätt. Tar korten i draghögen slut, det understa kortet används aldrig, tar given alla dittills avverkad kort, blandar om dem och använder dem som en ny draghög.

## <i class="fa fa-flag-o"></i> Uppgift
Du ska skriva en Javascriptapplikation som simulerar kortspelet Tjugoett enligt givna regler. Inget hasardmoment, d.v.s. ingen satsning av pengar, behöver förekomma. Du väljer själv om det ska vara en eller flera spelare utöver given. Ingen interaktion med användare ska finnas utan både spelare och giv ska dra kort från draghögen enligt en förutbestämd algoritm utformad enligt ditt eget tycke. Exempelvis kan du välja att en spelare är nöjd då summan uppgår till 15.

Startpunkten för applikationen ska vara i filen `app.js`, placerad i roten av Javascript-applikationen. Övriga Javascript-filer ska vara placerade i underkatalogen `src`.

Din applikation måste innefatta minst tre egendefinierade typer, som objekt instansieras utifrån. Samtliga typer ska vara placerade i olika moduler. Du väljer själv vad typerna ska representera. Kanske skapar du typer för spelbord, draghög, giv, spelare, hand, spelkort, färg, valör, ...?     

Efter varje spelomgång ska resultatet presenteras. Det ska framgå vilka kort spelare och giv dragit, respektive hands summa och vem som vunnit. Bilderna nedan är __förslag__ på presentation av resultatet av olika spelomgångar.

![](img/p15-d20-dwin.png)
![](img/p21-d-pwin.png)
![](img/p18-d18-dwin.png)
![](img/p15-d25-busted-pwin.png)
![](img/p24-busted-dwin.png)
![](img/p16-5-card-d-pwin.png)

## <i class="fa fa-eye"></i> Bedömning
Bedömning av examinationsuppgiften görs enligt skalan U/G/VG. För att få VG i slutbetyg krävs VG på denna examinationsuppgift, samt G på examinationsuppgift 1 och 2.

Samtliga åtta mål i kursplanen examineras, men framför allt det åttonde och sista målet, "analysera problem för att därefter värdera och välja lämplig design samt konstruera lösning i form av program i programspråket Javascript (8)". 

Betygsgraden bestäms utifrån hur väl du kan visa att du tillgodogjort dig kursens samtliga moment och den praktiska tillämpning av dessa. Utökningar av uppgiften kan premieras.

## <i class="fa fa-lightbulb-o"></i> Tips
Ett vanligt sätt att representera en kortlek är att använda en array. För att blanda arrayen brukar algoritmen _Fisher-Yates Shuffle_ användas i en eller annan form.
