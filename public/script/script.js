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