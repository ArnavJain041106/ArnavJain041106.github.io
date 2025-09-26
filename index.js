console.log('Happy developing ✨')

// Global variable to store projects
let projectsData = [];

// Function to fetch projects from Supabase
async function fetchProjects() {
  console.log('🔄 Fetching projects from Supabase...');
  
  try {
    const { data, error } = await supabase
      .from("project")
      .select("*")
      .order('id', { ascending: true });

    if (error) {
      console.error("❌ Failed to fetch projects:", error.message);
      showProjectsError();
      return [];
    } else {
      console.log("✅ Projects loaded successfully:", data);
      projectsData = data;
      return data;
    }
  } catch (err) {
    console.error("❌ Network error:", err);
    showProjectsError();
    return [];
  }
}

// Function to create project card HTML
function createProjectCard(project) {
  const hasLiveLink = project.live_link && project.live_link.trim();
  const imageDisplay = project.image_url 
    ? `<img src="${project.image_url}" alt="${project.title}" class="project-image-img" />` 
    : `<div class="project-placeholder"><i class="fas fa-code"></i></div>`;
  
  return `
    <div class="glass-card project-card" style="opacity: 0; transform: translateY(30px);">
      <div class="project-image">
        ${imageDisplay}
      </div>
      <div class="project-content">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="project-links">
          ${project.github_link ? `<a href="${project.github_link}" class="btn btn-small btn-outline" target="_blank" rel="noopener"><i class="fab fa-github"></i>Code</a>` : ''}
          ${hasLiveLink ? `<a href="${project.live_link}" class="btn btn-small btn-primary" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i>Live Demo</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Function to render projects
function renderProjects(projects) {
  const projectsGrid = document.querySelector('.projects-grid');
  
  if (!projectsGrid) {
    console.error('❌ Projects grid not found');
    return;
  }

  // Clear loading state
  projectsGrid.innerHTML = '';
  
  if (projects.length === 0) {
    projectsGrid.innerHTML = '<div class="glass-card project-card"><div class="project-content"><h3>No Projects Found</h3><p>Projects will appear here once added to the database.</p></div></div>';
    return;
  }

  // Render project cards
  projects.forEach(project => {
    projectsGrid.insertAdjacentHTML('beforeend', createProjectCard(project));
  });

  // Animate project cards
  animateProjectCards();
}

// Function to animate project cards with stagger effect
function animateProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100); // Stagger animation by 100ms
  });
}

// Function to show loading state
function showProjectsLoading() {
  const projectsGrid = document.querySelector('.projects-grid');
  if (projectsGrid) {
    projectsGrid.innerHTML = `
      <div class="glass-card project-card loading-card">
        <div class="project-content">
          <div class="loading-skeleton">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text"></div>
          </div>
        </div>
      </div>
      <div class="glass-card project-card loading-card">
        <div class="project-content">
          <div class="loading-skeleton">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text"></div>
          </div>
        </div>
      </div>
      <div class="glass-card project-card loading-card">
        <div class="project-content">
          <div class="loading-skeleton">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text"></div>
          </div>
        </div>
      </div>
    `;
  }
}

// Function to show error state
function showProjectsError() {
  const projectsGrid = document.querySelector('.projects-grid');
  if (projectsGrid) {
    projectsGrid.innerHTML = `
      <div class="glass-card project-card error-card">
        <div class="project-content">
          <h3><i class="fas fa-exclamation-triangle"></i> Failed to Load Projects</h3>
          <p>Unable to connect to the database. Please check your connection and try again.</p>
          <button onclick="loadProjects()" class="btn btn-small btn-primary">
            <i class="fas fa-retry"></i> Retry
          </button>
        </div>
      </div>
    `;
  }
}

// Main function to load and display projects
async function loadProjects() {
  showProjectsLoading();
  const projects = await fetchProjects();
  renderProjects(projects);
}

// Initialize projects when DOM is loaded - only on projects page
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the projects page by looking for projects-grid element
  const projectsGrid = document.querySelector('.projects-grid');
  if (projectsGrid) {
    console.log('🚀 Initializing dynamic projects...');
    loadProjects();
  }
});

// Test Supabase connection
async function testSupabase() {
  const { data, error } = await supabase.from("project").select("*").limit(1);

  if (error) {
    console.error("❌ Supabase connection failed:", error.message);
  } else {
    console.log("✅ Supabase connected! Sample data:", data);
  }
}

testSupabase();

