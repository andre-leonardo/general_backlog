document.getElementById('showEditGame').addEventListener('click', function(){
    if(check != null)
    {
        check++
        console.log(check)
    }
})

function toggleVisibility(id) {
    var e = document.getElementById(id);
    if(e.style.display == 'block')
       e.style.display = 'none';
    else
       e.style.display = 'block';
} 

function resizeInput() {
  this.style.width = this.value.length + "ch";
}

function onLogin() {
    document.getElementById("overlay").style.display = "block";
  }
  
function off() {
    document.getElementById("overlay").style.display = "none";
} 

function onRegister() {
  document.getElementsByClassName("register")[0].style.display = "block";
}

function offRegister() {
  document.getElementsByClassName("register")[0].style.display = "none";
}

function onAdd() {
  document.getElementsByClassName("add")[0].style.display = "block";
}

function offAdd() {
  document.getElementsByClassName("add")[0].style.display = "none";
}


