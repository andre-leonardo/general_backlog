A general backlog page with the use of some APIs
Giantbomb for games
TheMovieDataBase(TMDB) for movies
I still didn't add a books tab, but I guess I will use the Google books API
Each user can also create custom backlogs of anything they want(nothing criminal I hope)
Last thing I plan to add is a forum where users can talk between eachother about the items they add in the premade backlogs.


If for some crazy reason you are not me and found this repository, and for some even crazier reason want to run it in your machine, you will need to create a .env file with these variables: 

API_GAMES = [YOUR GIANT BOMB API KEY]
API_MOVIES = [YOUR TMDB API KEY]
MOVIES_BEARER = [YOUR TMBD API KEY BEARER]

(or simply replace them with the actual key in the app.js file)

right now you can only add images through links

forum.js - stores the discussions and anwers from each user
user.js - stores the users and the backlogs/customlogs from each one

home.ejs - the base page of the site, this is the only page someone can access without being logged in
user.ejs - details of the user
editUser.ejs - here the user can edit info like avatar, bio, username...
custom.ejs - lets the user create custom backlogs and see the ones they already created
customTrue.ejs - shows all items in the specific custom backlog the user created
forum.ejs - all discussions and answers are here, the forum is made only for games and movies
game.ejs - lets the user add games using the GiantBomb API and see all the ones they already added
movie.ejs - same as the page above but with movies and using the TheMovieDataBase API
gamedetail - shows details for each specific item in all backlogs and lets you edit them


