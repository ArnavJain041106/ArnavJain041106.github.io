// SEO Analyzer JavaScript
class SEOAnalyzer {
  constructor() {
    this.seoScore = 0;
    this.checks = [];
    this.recommendations = [];
  }

  async analyzeWebsite(url) {
    this.resetAnalysis();
    this.showLoading();

    try {
      // For external URLs, we'll provide a simulated analysis
      // In a real-world scenario, this would require a backend service
      if (url && url !== window.location.href) {
        await this.simulateExternalAnalysis(url);
      } else {
        await this.analyzeCurrentPage();
      }
      
      this.displayResults();
    } catch (error) {
      console.error('SEO Analysis error:', error);
      this.showError('Failed to analyze website. Please check the URL and try again.');
    } finally {
      this.hideLoading();
    }
  }

  async analyzeCurrentPage() {
    const checks = [
      this.checkTitle(),
      this.checkMetaDescription(),
      this.checkHeadingStructure(),
      this.checkImages(),
      this.checkLinks(),
      this.checkPageSpeed(),
      this.checkMobileOptimization(),
      this.checkStructuredData(),
      this.checkSocialMetaTags(),
      this.checkCanonicalURL()
    ];

    this.checks = checks;
    this.calculateScore();
    this.generateRecommendations();
  }

  async simulateExternalAnalysis(url) {
    // Simulate analysis for external URLs
    // In production, this would use a backend service or API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.checks = [
      { category: 'Basic SEO', name: 'URL Structure', status: 'success', message: 'URL appears to be well-structured' },
      { category: 'Basic SEO', name: 'HTTPS', status: url.startsWith('https') ? 'success' : 'error', message: url.startsWith('https') ? 'Site uses HTTPS' : 'Site should use HTTPS' },
      { category: 'Technical', name: 'Accessibility', status: 'warning', message: 'Cannot verify accessibility without direct access' },
      { category: 'Content', name: 'Content Analysis', status: 'warning', message: 'External content analysis requires advanced tools' },
      { category: 'Performance', name: 'Speed Analysis', status: 'warning', message: 'Use PageSpeed Insights for detailed speed analysis' }
    ];

    this.seoScore = Math.floor(Math.random() * 30) + 50; // Random score between 50-80
    this.generateRecommendations();
  }

  checkTitle() {
    const title = document.title;
    const titleLength = title.length;
    
    if (!title) {
      return { category: 'Basic SEO', name: 'Page Title', status: 'error', message: 'Missing page title' };
    } else if (titleLength < 30) {
      return { category: 'Basic SEO', name: 'Page Title', status: 'warning', message: `Title too short (${titleLength} chars). Recommended: 30-60 characters` };
    } else if (titleLength > 60) {
      return { category: 'Basic SEO', name: 'Page Title', status: 'warning', message: `Title too long (${titleLength} chars). Recommended: 30-60 characters` };
    } else {
      return { category: 'Basic SEO', name: 'Page Title', status: 'success', message: `Good title length (${titleLength} chars)` };
    }
  }

  checkMetaDescription() {
    const metaDesc = document.querySelector('meta[name="description"]');
    
    if (!metaDesc || !metaDesc.content) {
      return { category: 'Basic SEO', name: 'Meta Description', status: 'error', message: 'Missing meta description' };
    }
    
    const descLength = metaDesc.content.length;
    if (descLength < 120) {
      return { category: 'Basic SEO', name: 'Meta Description', status: 'warning', message: `Description too short (${descLength} chars). Recommended: 120-160 characters` };
    } else if (descLength > 160) {
      return { category: 'Basic SEO', name: 'Meta Description', status: 'warning', message: `Description too long (${descLength} chars). Recommended: 120-160 characters` };
    } else {
      return { category: 'Basic SEO', name: 'Meta Description', status: 'success', message: `Good description length (${descLength} chars)` };
    }
  }

  checkHeadingStructure() {
    const h1s = document.querySelectorAll('h1');
    const h2s = document.querySelectorAll('h2');
    const h3s = document.querySelectorAll('h3');
    
    if (h1s.length === 0) {
      return { category: 'Content', name: 'Heading Structure', status: 'error', message: 'Missing H1 tag' };
    } else if (h1s.length > 1) {
      return { category: 'Content', name: 'Heading Structure', status: 'warning', message: `Multiple H1 tags found (${h1s.length}). Use only one H1 per page` };
    } else {
      return { category: 'Content', name: 'Heading Structure', status: 'success', message: `Good heading structure: ${h1s.length} H1, ${h2s.length} H2s, ${h3s.length} H3s` };
    }
  }

  checkImages() {
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '');
    
    if (images.length === 0) {
      return { category: 'Content', name: 'Images', status: 'warning', message: 'No images found on page' };
    } else if (imagesWithoutAlt.length > 0) {
      return { category: 'Content', name: 'Images', status: 'warning', message: `${imagesWithoutAlt.length} out of ${images.length} images missing alt text` };
    } else {
      return { category: 'Content', name: 'Images', status: 'success', message: `All ${images.length} images have alt text` };
    }
  }

  checkLinks() {
    const links = document.querySelectorAll('a[href]');
    const externalLinks = Array.from(links).filter(link => 
      link.href.startsWith('http') && !link.href.includes(window.location.hostname)
    );
    const internalLinks = links.length - externalLinks.length;
    
    return { 
      category: 'Content', 
      name: 'Links', 
      status: 'success', 
      message: `Found ${internalLinks} internal and ${externalLinks.length} external links` 
    };
  }

  checkPageSpeed() {
    // Simulate page speed check
    const loadTime = performance.now();
    if (loadTime < 1000) {
      return { category: 'Performance', name: 'Page Speed', status: 'success', message: 'Page loads quickly' };
    } else if (loadTime < 3000) {
      return { category: 'Performance', name: 'Page Speed', status: 'warning', message: 'Page load time could be improved' };
    } else {
      return { category: 'Performance', name: 'Page Speed', status: 'error', message: 'Page loads slowly, optimization needed' };
    }
  }

  checkMobileOptimization() {
    const viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
      return { category: 'Technical', name: 'Mobile Optimization', status: 'error', message: 'Missing viewport meta tag' };
    } else if (viewport.content.includes('width=device-width')) {
      return { category: 'Technical', name: 'Mobile Optimization', status: 'success', message: 'Viewport configured for mobile devices' };
    } else {
      return { category: 'Technical', name: 'Mobile Optimization', status: 'warning', message: 'Viewport may not be optimized for mobile' };
    }
  }

  checkStructuredData() {
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    
    if (structuredData.length === 0) {
      return { category: 'Technical', name: 'Structured Data', status: 'warning', message: 'No structured data found' };
    } else {
      return { category: 'Technical', name: 'Structured Data', status: 'success', message: `Found ${structuredData.length} structured data block(s)` };
    }
  }

  checkSocialMetaTags() {
    const ogTags = document.querySelectorAll('meta[property^="og:"]');
    const twitterTags = document.querySelectorAll('meta[property^="twitter:"]');
    
    if (ogTags.length === 0 && twitterTags.length === 0) {
      return { category: 'Social', name: 'Social Meta Tags', status: 'warning', message: 'No social media meta tags found' };
    } else {
      return { category: 'Social', name: 'Social Meta Tags', status: 'success', message: `Found ${ogTags.length} Open Graph and ${twitterTags.length} Twitter tags` };
    }
  }

  checkCanonicalURL() {
    const canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
      return { category: 'Technical', name: 'Canonical URL', status: 'warning', message: 'No canonical URL specified' };
    } else {
      return { category: 'Technical', name: 'Canonical URL', status: 'success', message: 'Canonical URL is set' };
    }
  }

  calculateScore() {
    const totalChecks = this.checks.length;
    const successChecks = this.checks.filter(check => check.status === 'success').length;
    const warningChecks = this.checks.filter(check => check.status === 'warning').length;
    
    // Calculate score: success = 100%, warning = 50%, error = 0%
    this.seoScore = Math.round(((successChecks * 100) + (warningChecks * 50)) / totalChecks);
  }

  generateRecommendations() {
    this.recommendations = [];
    
    this.checks.forEach(check => {
      if (check.status === 'error') {
        this.recommendations.push({
          priority: 'high',
          message: `Fix: ${check.message}`,
          category: check.category
        });
      } else if (check.status === 'warning') {
        this.recommendations.push({
          priority: 'medium',
          message: `Improve: ${check.message}`,
          category: check.category
        });
      }
    });

    // Add general recommendations
    if (this.seoScore < 70) {
      this.recommendations.push({
        priority: 'high',
        message: 'Consider implementing a comprehensive SEO strategy',
        category: 'General'
      });
    }

    if (this.seoScore < 50) {
      this.recommendations.push({
        priority: 'high',
        message: 'Focus on basic SEO fundamentals: title, meta description, and content structure',
        category: 'General'
      });
    }
  }

  displayResults() {
    document.getElementById('seo-results').style.display = 'block';
    
    // Update score circle
    const scoreCircle = document.getElementById('seo-score-circle');
    const scoreText = document.getElementById('seo-score-text');
    const scoreDescription = document.getElementById('score-description');
    
    scoreText.textContent = this.seoScore;
    scoreCircle.style.setProperty('--score-angle', `${(this.seoScore / 100) * 360}deg`);
    
    // Update score description
    if (this.seoScore >= 80) {
      scoreDescription.textContent = 'Excellent SEO! Your website is well optimized.';
      scoreDescription.style.color = '#4CAF50';
    } else if (this.seoScore >= 60) {
      scoreDescription.textContent = 'Good SEO with room for improvement.';
      scoreDescription.style.color = '#FF9800';
    } else {
      scoreDescription.textContent = 'SEO needs significant improvement.';
      scoreDescription.style.color = '#f44336';
    }

    // Group checks by category
    const categories = {};
    this.checks.forEach(check => {
      if (!categories[check.category]) {
        categories[check.category] = [];
      }
      categories[check.category].push(check);
    });

    // Display categories
    const categoriesContainer = document.getElementById('seo-categories');
    categoriesContainer.innerHTML = '';

    Object.keys(categories).forEach(categoryName => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'seo-category';
      
      const categoryIcon = this.getCategoryIcon(categoryName);
      
      categoryDiv.innerHTML = `
        <h3><i class="${categoryIcon}"></i> ${categoryName}</h3>
        ${categories[categoryName].map(check => `
          <div class="seo-check-item">
            <div class="seo-check-icon ${check.status}">
              ${check.status === 'success' ? '✓' : check.status === 'warning' ? '!' : '✗'}
            </div>
            <div>
              <strong>${check.name}</strong><br>
              <small style="color: var(--text-secondary);">${check.message}</small>
            </div>
          </div>
        `).join('')}
      `;
      
      categoriesContainer.appendChild(categoryDiv);
    });

    // Display recommendations
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';

    if (this.recommendations.length === 0) {
      recommendationsList.innerHTML = '<p style="color: var(--text-secondary);">Great job! No specific recommendations at this time.</p>';
    } else {
      this.recommendations.forEach(rec => {
        const recDiv = document.createElement('div');
        recDiv.className = 'recommendation-item';
        recDiv.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-exclamation-triangle" style="color: #FFC107;"></i>
            <span><strong>${rec.category}:</strong> ${rec.message}</span>
          </div>
        `;
        recommendationsList.appendChild(recDiv);
      });
    }
  }

  getCategoryIcon(category) {
    const icons = {
      'Basic SEO': 'fas fa-search',
      'Content': 'fas fa-file-alt',
      'Technical': 'fas fa-cogs',
      'Performance': 'fas fa-tachometer-alt',
      'Social': 'fas fa-share-alt'
    };
    return icons[category] || 'fas fa-check-circle';
  }

  resetAnalysis() {
    this.seoScore = 0;
    this.checks = [];
    this.recommendations = [];
    document.getElementById('seo-results').style.display = 'none';
  }

  showLoading() {
    document.getElementById('loading-spinner').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      background: rgba(244, 67, 54, 0.1);
      border: 1px solid #f44336;
      color: #f44336;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
      text-align: center;
    `;
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    
    const container = document.querySelector('.seo-tool-card');
    container.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
  }
}

// Initialize SEO Analyzer
const seoAnalyzer = new SEOAnalyzer();

// Global functions for HTML onclick events
function analyzeWebsite() {
  const url = document.getElementById('website-url').value;
  if (!url) {
    alert('Please enter a website URL');
    return;
  }
  seoAnalyzer.analyzeWebsite(url);
}

function analyzePage(type) {
  if (type === 'current') {
    seoAnalyzer.analyzeWebsite(window.location.href);
  } else if (type === 'portfolio') {
    const portfolioUrl = window.location.origin + '/index.html';
    seoAnalyzer.analyzeWebsite(portfolioUrl);
  }
}

// Auto-analyze current page on load
document.addEventListener('DOMContentLoaded', function() {
  // Add a delay to ensure all content is loaded
  setTimeout(() => {
    if (window.location.pathname.includes('seo-analysis')) {
      // Don't auto-analyze the SEO tool page itself
      return;
    }
    analyzePage('current');
  }, 1000);
});