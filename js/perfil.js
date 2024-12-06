function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    const links = document.querySelectorAll('.sidebar ul li a');
    links.forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(sectionId + '-link').classList.add('active');
}

// Função para trocar a foto de perfil
function changeProfilePhoto(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const profileImage = document.getElementById('profile-image');
        profileImage.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}
function goBack() {
    window.history.back();
}