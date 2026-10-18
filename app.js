const DATA_KEY = 'mianAzamPortfolioV3';
const ADMIN_KEY = 'mianAzamAdminSession';
const LOGIN_ATTEMPTS_KEY = 'mianAzamAdminAttempts';
const ADMIN_PASSWORD_HASH = '57e18e5443d756c691bf12194e15532d04197c72e607b6080a6f421a61b56554';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

const defaults = {
  headline: 'Python & AI Automation Learner building practical, working projects with curiosity and care.',
  github: 'https://github.com/',
  email: 'Miandastgir76@gmail.com',
  photo: '',
  skills: ['Python', 'AI tools', 'n8n', 'Cloud computing', 'Cybersecurity fundamentals', 'GitHub'],
  projects: [
    { name: 'WhatsApp AI Insurance Assistant MVP', description: 'A learning prototype that explores how a WhatsApp conversation could guide a user through basic insurance questions and next steps. It is an MVP for practice, not a live insurance advisory service.', tools: 'WhatsApp · AI tools · Automation', link: '', featured: true },
    { name: 'Gmail AI Classification Workflow', description: 'A practical n8n workflow idea for sorting incoming Gmail messages into useful categories with AI assistance. I am refining the workflow logic and prompts as I test it.', tools: 'n8n · Gmail · AI tools', link: '', featured: true },
    { name: 'Python Practice Projects', description: 'A growing collection of small Python projects used to practise core programming concepts and build useful, working tools.', tools: 'Python · GitHub', link: '', featured: true }
  ]
};

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(DATA_KEY) || localStorage.getItem('mianAzamPortfolioV2') || '{}');
    const projects = (stored.projects || defaults.projects).map((project, index) => ({ ...project, featured: project.featured ?? index < 3 }));
    return { ...defaults, ...stored, skills: stored.skills || defaults.skills, projects };
  } catch { return { ...defaults }; }
}

let portfolio = loadData();
const saveData = () => localStorage.setItem(DATA_KEY, JSON.stringify(portfolio));
const safeUrl = value => /^https?:\/\//i.test(value || '') ? value : '';
const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const featuredProjects = () => portfolio.projects.filter(project => project.featured).slice(0, 3);

function card(project, index) {
  const link = safeUrl(project.link);
  return `<article class="project-card reveal"><span class="project-number">PROJECT ${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.description)}</p><footer><span>${escapeHtml(project.tools || 'In progress')}</span>${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noreferrer">View ↗</a>` : '<span>Learning project</span>'}</footer></article>`;
}

function renderProjects(target, projects) {
  const element = document.getElementById(target);
  if (element) element.innerHTML = projects.map(card).join('');
}

function renderSkills(target, editable = false) {
  const element = document.getElementById(target);
  if (!element) return;
  element.innerHTML = portfolio.skills.map((skill, index) => editable
    ? `<span class="admin-skill">${escapeHtml(skill)} <button class="remove-button" data-skill="${index}" aria-label="Remove ${escapeHtml(skill)}">×</button></span>`
    : `<span class="skill">${escapeHtml(skill)}</span>`).join('');
}

function setPhoto() {
  const image = document.getElementById('profileImage');
  const placeholder = document.getElementById('profilePlaceholder');
  if (!image || !portfolio.photo) return;
  image.src = portfolio.photo;
  image.style.display = 'block';
  placeholder.style.display = 'none';
}

function setBrandName() {
  const style = document.createElement('style');
  style.textContent = '.wordmark{position:relative;display:flex!important;flex-direction:column;gap:2px;min-width:190px;font-size:.78rem!important;letter-spacing:.04em!important;line-height:1!important;text-transform:uppercase}.wordmark:before{position:absolute;left:0;top:50%;transform:translate(-16px,-50%)}.wordmark .brand-first{color:#101512!important;font-weight:800}.wordmark .brand-last{color:#5d8455!important;font-size:1.15rem;font-weight:950;letter-spacing:-.055em;text-transform:none}@media(max-width:520px){.wordmark{min-width:150px;font-size:.64rem!important}.wordmark .brand-last{font-size:1rem}}';
  document.head.append(style);
  document.querySelectorAll('.wordmark').forEach(mark => { mark.innerHTML = '<span class="brand-first">Mian Ghulam</span><span class="brand-last">Dastgir Azam</span>'; });
}

async function hashPassword(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function loginState() {
  try { return JSON.parse(sessionStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{"count":0,"lockedUntil":0}'); }
  catch { return { count: 0, lockedUntil: 0 }; }
}

function saveLoginState(state) { sessionStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(state)); }

function initSecretAdminAccess() {
  if (document.body.dataset.page === 'admin') return;
  const brand = document.querySelector('.wordmark');
  if (!brand) return;
  let taps = 0;
  let resetTimer;
  brand.addEventListener('click', event => {
    event.preventDefault();
    taps += 1;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { taps = 0; }, 5000);
    if (taps === 20) window.location.href = 'admin.html';
  });
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  items.forEach(item => observer.observe(item));
}

function initPublic() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  if (document.body.dataset.page === 'home') {
    document.getElementById('heroHeadline').textContent = portfolio.headline;
    document.getElementById('githubLink').href = safeUrl(portfolio.github) || defaults.github;
    document.getElementById('contactLink').href = `mailto:${portfolio.email}`;
    renderProjects('featuredProjects', featuredProjects());
    renderSkills('skillList');
    setPhoto();
  }
  if (document.body.dataset.page === 'projects') renderProjects('allProjects', portfolio.projects);
  initReveal();
}

function fillProjectForm(index) {
  const project = portfolio.projects[index];
  document.getElementById('editingProjectIndex').value = index;
  document.getElementById('projectName').value = project.name;
  document.getElementById('projectDescription').value = project.description;
  document.getElementById('projectTools').value = project.tools;
  document.getElementById('projectLink').value = project.link;
  document.getElementById('featureProject').checked = project.featured;
  document.getElementById('projectFormTitle').textContent = 'Edit project';
  document.getElementById('projectSubmit').textContent = 'Save changes';
  document.getElementById('cancelProjectEdit').hidden = false;
  document.getElementById('projectForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearProjectForm() {
  document.getElementById('projectForm').reset();
  document.getElementById('editingProjectIndex').value = '';
  document.getElementById('projectFormTitle').textContent = 'Add a project';
  document.getElementById('projectSubmit').textContent = 'Add project';
  document.getElementById('cancelProjectEdit').hidden = true;
}

function renderManager() {
  const element = document.getElementById('projectManager');
  if (!element) return;
  element.innerHTML = portfolio.projects.map((project, index) => `<div class="managed-project"><div><p>${escapeHtml(project.name)}</p><small>${project.featured ? 'Featured on homepage' : 'Project library only'}</small></div><div><button class="text-button" data-edit="${index}">Edit</button><button class="remove-button" data-project="${index}">Remove</button></div></div>`).join('');
  element.onclick = event => {
    const editIndex = event.target.dataset.edit;
    const removeIndex = event.target.dataset.project;
    if (editIndex !== undefined) fillProjectForm(Number(editIndex));
    if (removeIndex !== undefined && confirm('Remove this project?')) {
      portfolio.projects.splice(Number(removeIndex), 1);
      saveData();
      renderManager();
    }
  };
}

function initAdmin() {
  if (document.body.dataset.page !== 'admin') return;
  const adminStyle = document.createElement('style');
  adminStyle.textContent = '.feature-toggle{display:flex!important;align-items:center;gap:8px;margin-top:17px!important;font-size:.88rem!important}.feature-toggle input{width:auto}.admin-help,.managed-project small{color:#5d6d5f;font-size:.82rem}';
  document.head.append(adminStyle);
  const loginBox = document.getElementById('loginBox');
  const dashboard = document.getElementById('dashboard');
  const showDashboard = () => {
    loginBox.hidden = true;
    dashboard.hidden = false;
    document.getElementById('headlineInput').value = portfolio.headline;
    document.getElementById('githubInput').value = portfolio.github;
    document.getElementById('emailInput').value = portfolio.email;
    renderSkills('adminSkills', true);
    renderManager();
  };
  if (sessionStorage.getItem(ADMIN_KEY) === 'true') showDashboard();
  document.getElementById('loginForm').onsubmit = async event => {
    event.preventDefault();
    const error = document.getElementById('loginError');
    const state = loginState();
    const now = Date.now();
    if (state.lockedUntil > now) {
      error.textContent = `Too many attempts. Try again in ${Math.ceil((state.lockedUntil - now) / 1000)} seconds.`;
      return;
    }
    const passwordHash = await hashPassword(document.getElementById('adminPassword').value);
    if (passwordHash === ADMIN_PASSWORD_HASH) {
      sessionStorage.setItem(ADMIN_KEY, 'true');
      saveLoginState({ count: 0, lockedUntil: 0 });
      showDashboard();
    } else {
      const count = state.count + 1;
      const next = count >= MAX_LOGIN_ATTEMPTS ? { count: 0, lockedUntil: now + LOCKOUT_MS } : { count, lockedUntil: 0 };
      saveLoginState(next);
      error.textContent = next.lockedUntil ? 'Too many attempts. Please wait one minute before trying again.' : `Incorrect password. ${MAX_LOGIN_ATTEMPTS - count} attempt(s) remaining.`;
    }
  };
  document.getElementById('logout').onclick = () => { sessionStorage.removeItem(ADMIN_KEY); location.reload(); };
  document.getElementById('profileForm').onsubmit = event => {
    event.preventDefault();
    portfolio.headline = document.getElementById('headlineInput').value.trim();
    portfolio.github = safeUrl(document.getElementById('githubInput').value.trim()) || defaults.github;
    portfolio.email = document.getElementById('emailInput').value.trim() || defaults.email;
    saveData(); alert('Profile saved.');
  };
  document.getElementById('photoInput').onchange = event => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { portfolio.photo = reader.result; saveData(); alert('Photo saved.'); };
    reader.readAsDataURL(file);
  };
  document.getElementById('projectForm').onsubmit = event => {
    event.preventDefault();
    const index = document.getElementById('editingProjectIndex').value;
    const featured = document.getElementById('featureProject').checked;
    const currentFeatured = portfolio.projects.filter((project, projectIndex) => project.featured && String(projectIndex) !== index).length;
    if (featured && currentFeatured >= 3) { alert('Only three projects can appear on the homepage. Uncheck a featured project first.'); return; }
    const item = { name: document.getElementById('projectName').value.trim(), description: document.getElementById('projectDescription').value.trim(), tools: document.getElementById('projectTools').value.trim(), link: safeUrl(document.getElementById('projectLink').value.trim()), featured };
    if (index === '') portfolio.projects.unshift(item); else portfolio.projects[Number(index)] = item;
    saveData(); clearProjectForm(); renderManager(); alert(index === '' ? 'Project added.' : 'Project updated.');
  };
  document.getElementById('cancelProjectEdit').onclick = clearProjectForm;
  document.getElementById('skillForm').onsubmit = event => {
    event.preventDefault(); const input = document.getElementById('skillInput');
    if (input.value.trim()) { portfolio.skills.push(input.value.trim()); saveData(); input.value = ''; renderSkills('adminSkills', true); }
  };
  document.getElementById('adminSkills').onclick = event => {
    const index = event.target.dataset.skill;
    if (index !== undefined) { portfolio.skills.splice(Number(index), 1); saveData(); renderSkills('adminSkills', true); }
  };
}

setBrandName();
initSecretAdminAccess();
initPublic();
initAdmin();
