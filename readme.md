A general backlog page with the use of some APIs <br>
Giantbomb for games <br>
TheMovieDataBase(TMDB) for movies <br>
I still didn't add a books tab, but I guess I will use the Google books API <br>
Each user can also create custom backlogs of anything they want(nothing criminal I hope) <br>
Last thing I plan to add is a forum where users can talk between eachother about the items they add in the premade backlogs. <br>


If for some crazy reason you are not me and found this repository,  <br>and for some even crazier reason want to run it in your machine,  <br>you will need to create a .env file with these variables: 

API_GAMES = [YOUR GIANT BOMB API KEY] <br>
API_MOVIES = [YOUR TMDB API KEY] <br>
MOVIES_BEARER = [YOUR TMBD API KEY BEARER] <br>

(or simply replace them with the actual key in the app.js file) <br>

right now you can only add images through links <br>

forum.js - stores the discussions and anwers from each user <br>
user.js - stores the users and the backlogs/customlogs from each one <br>

home.ejs - the base page of the site, this is the only page someone can access without being logged in <br>
user.ejs - details of the user <br>
editUser.ejs - here the user can edit info like avatar, bio, username...  <br>
custom.ejs - lets the user create custom backlogs and see the ones they already created <br>
customTrue.ejs - shows all items in the specific custom backlog the user created <br>
forum.ejs - all discussions and answers are here, the forum is made only for games and movies <br>
game.ejs - lets the user add games using the GiantBomb API and see all the ones they already added <br>
movie.ejs - same as the page above but with movies and using the TheMovieDataBase API <br>
gamedetail - shows details for each specific item in all backlogs and lets you edit them <br>

![color picker]([https://bobbyhadz.com/images/blog/change-vscode-integrated-terminal-colors/hover-over-color.gif](https://cdn.pixabay.com/animation/2023/01/06/20/32/20-32-50-196_512.gif)https://cdn.pixabay.com/animation/2023/01/06/20/32/20-32-50-196_512.gif)


