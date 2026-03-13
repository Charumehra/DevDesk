const typewriterElement = document.getElementById("typewriter");
if (typewriterElement) {
  const words = [
    "Find Developers ",
    "Explore GitHub Profiles ",
    "Battle Dev Skills ",
    "Discover Open Source "
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentWord = words[wordIndex];
    typewriterElement.textContent = currentWord.substring(0, charIndex);

    if (!isDeleting) charIndex++;
    else charIndex--;

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      speed = 1500;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 300;
    }

    setTimeout(typeEffect, speed);
  }

  typeEffect();
}


const searchPageBtn = document.getElementById('searchPageBtn');
const battlePageBtn = document.getElementById('battlePageBtn');

if (searchPageBtn) {
  searchPageBtn.addEventListener('click', () => window.location.href = 'search.html');
}
if (battlePageBtn) {
  battlePageBtn.addEventListener('click', () => window.location.href = 'battle.html');
}


const usernameInput = document.getElementById('usernameInput');
const searchUserBtn = document.getElementById('searchUserBtn');
const currentState = document.getElementById('status');
const profileCard = document.getElementById('profileCard');
const avatar = document.getElementById('avatar');
const nameEl = document.getElementById('name');
const bio = document.getElementById('bio');
const joinDate = document.getElementById('joinDate');
const portfolio = document.getElementById('portfolio');
const repoList = document.getElementById('repoList');
const battleUser1Input = document.getElementById('user1');
const battleUser2Input = document.getElementById('user2');
const battleBtnLogic = document.getElementById('battleBtn');
const resultContainer = document.getElementById('resultContainer');
const backHomeSearch = document.getElementById('backHomeSearch');
if (backHomeSearch) {
  backHomeSearch.addEventListener('click', () => {
    window.location.href = 'index.html'; 
  });
}

const backHomeBattle = document.getElementById('backHomeBattle');
if (backHomeBattle) {
  backHomeBattle.addEventListener('click', () => {
    window.location.href = 'index.html'; 
  });
}


if (searchUserBtn) {
  searchUserBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) return;
    fetchProfile(username);
  });

  async function fetchProfile(username) {
    profileCard.classList.add('hidden');
    currentState.textContent = 'Loading...';

    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (!res.ok) throw new Error('User Not Found');
      const data = await res.json();

      avatar.src = data.avatar_url;
      nameEl.textContent = data.name || data.login;
      bio.textContent = data.bio || 'No bio available';
      joinDate.textContent = `Joined: ${new Date(data.created_at).toLocaleDateString()}`;
      if (data.blog) {
        portfolio.href = data.blog.startsWith('http') ? data.blog : 'https://' + data.blog;
        portfolio.textContent = data.blog;
        portfolio.style.display = 'block';
      } else {
        portfolio.style.display = 'none';
      }

      profileCard.classList.remove('hidden');
      currentState.textContent = '';

      fetchRepos(data.repos_url);

    usernameInput.value = '';

    } catch (err) {
      currentState.textContent = err.message;
      profileCard.classList.add('hidden');
    }
  }

  async function fetchRepos(url) {
    repoList.innerHTML = 'Loading repos...';
    try {
      const res = await fetch(url + '?sort=created&per_page=5');
      const repos = await res.json();
      if (!repos.length) {
        repoList.innerHTML = '<li>No repositories found</li>';
        return;
      }

      repoList.innerHTML = '';
      repos.forEach(repo => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${repo.html_url}" target="_blank" class="text-blue-400 underline">${repo.name}</a>`;
        repoList.appendChild(li);
      });
    } catch (err) {
      repoList.innerHTML = '<li>Error fetching repositories</li>';
    }
  }
}


if (battleBtnLogic) {
  battleBtnLogic.addEventListener('click', () => {
    const user1 = battleUser1Input.value.trim();
    const user2 = battleUser2Input.value.trim();
    if (!user1 || !user2) return;
    startBattle(user1, user2);
  });

  async function startBattle(user1, user2) {
    if (currentState) currentState.textContent = 'Loading...';
    resultContainer.innerHTML = '';
    try {
      const [data1, data2] = await Promise.all([fetchUser(user1), fetchUser(user2)]);
      const [repos1, repos2] = await Promise.all([fetchAllRepos(data1.repos_url), fetchAllRepos(data2.repos_url)]);

      const stars1 = repos1.reduce((acc, repo) => acc + repo.stargazers_count, 0);
      const stars2 = repos2.reduce((acc, repo) => acc + repo.stargazers_count, 0);

      renderBattleCard(data1, stars1, stars1 >= stars2);
      renderBattleCard(data2, stars2, stars2 > stars1);

      if (currentState) currentState.textContent = '';
    } catch (err) {
      if (currentState) currentState.textContent = err.message;
    }
  }

  async function fetchUser(username) {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error(`User ${username} Not Found`);
    return res.json();
  }

  async function fetchAllRepos(url) {
    const res = await fetch(url);
    return res.json();
  }

  function renderBattleCard(user, stars, winner) {
    const card = document.createElement('div');
    card.className = `flex-1 bg-gray-800 rounded-lg p-4 flex flex-col items-center border-4 ${winner ? 'border-green-500' : 'border-red-500'}`;
    card.innerHTML = `
      <img src="${user.avatar_url}" alt="Avatar" class="w-24 h-24 rounded-full mb-2">
      <h2 class="text-xl font-bold mb-1">${user.name || user.login}</h2>
      <p class="mb-1">${user.bio || 'No bio'}</p>
      <p class="mb-1">Followers: ${user.followers} | Stars: ${stars}</p>
      <a href="${user.html_url}" target="_blank" class="text-blue-400 underline mt-2">GitHub Profile</a>
    `;
    resultContainer.appendChild(card);
  }
}

