document.querySelector('.signup-link').addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Clicou em Registo');
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
  });
  
  document.querySelector('.login-link').addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Clicou em Entrar');
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  });
  