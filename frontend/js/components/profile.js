import { put, get } from '../api/client.js';
import { getStoredUser, getMe } from '../api/auth.js';

export async function renderProfilePage(container) {
  const user = getStoredUser();

  async function loadUser() {
    try {
      const fresh = await getMe();
      localStorage.setItem('esg_user', JSON.stringify(fresh));
      return fresh;
    } catch {
      return user;
    }
  }

  const currentUser = await loadUser();

  let profileForm = {
    name: currentUser?.name || '',
    designation: currentUser?.designation || '',
    gender: currentUser?.gender || '',
    bio: currentUser?.bio || '',
  };

  function render() {
    container.innerHTML = `
      <div class="view-container" style="max-width:880px;">
        <div class="breadcrumb"><span class="breadcrumb-current">My Profile</span></div>
        <div class="view-header">
          <h1 class="view-title">My Profile</h1>
          <p class="view-description">Manage your personal details and view your ESG statistics</p>
        </div>

        <div class="grid-2" style="gap:20px;">
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="view-card" style="text-align:center;padding:32px 24px;">
              <div style="width:90px;height:90px;border-radius:50%;background:rgba(16,185,129,0.12);color:var(--accent-success);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:36px;margin:0 auto 16px;border:3px solid rgba(16,185,129,0.25);">
                ${currentUser?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <h3 style="font-size:18px;font-weight:700;margin-bottom:4px;color:var(--text-primary);">${currentUser?.name || 'User'}</h3>
              <p style="color:var(--text-secondary);font-size:13px;margin-bottom:12px;">${currentUser?.designation || 'Sustainability Partner'}</p>
              <span class="badge" style="background:var(--accent-success);color:#fff;padding:4px 10px;font-size:11px;border-radius:var(--radius-sm);">${currentUser?.role?.toUpperCase() || 'EMPLOYEE'}</span>
              ${currentUser?.bio ? `<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-color);font-size:13px;color:var(--text-secondary);font-style:italic;line-height:1.5;">"${currentUser.bio}"</div>` : ''}
            </div>

            <div class="view-card">
              <h4 style="font-size:14px;font-weight:700;margin-bottom:12px;color:var(--text-primary);">Organization Info</h4>
              <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">
                <div class="profile-info-row"><span style="color:var(--text-muted);">Email:</span><span style="font-weight:600;">${currentUser?.email || 'N/A'}</span></div>
                <div class="profile-info-row"><span style="color:var(--text-muted);">Department:</span><span style="font-weight:600;">${currentUser?.department_id || 'Unassigned'}</span></div>
                <div class="profile-info-row"><span style="color:var(--text-muted);">Gender:</span><span style="font-weight:600;">${currentUser?.gender || 'Not set'}</span></div>
                <div class="profile-info-row"><span style="color:var(--text-muted);">Email Verified:</span><span style="font-weight:600;">${currentUser?.is_email_verified ? 'Yes' : 'No'}</span></div>
              </div>
            </div>

            <div class="view-card">
              <h4 style="font-size:14px;font-weight:700;margin-bottom:12px;color:var(--text-primary);">Gamification Stats</h4>
              <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">
                <div class="profile-info-row"><span style="color:var(--text-muted);">XP Earned:</span><span style="font-weight:600;color:var(--accent-success);">${currentUser?.xp_points || 0} XP</span></div>
                <div class="profile-info-row"><span style="color:var(--text-muted);">Points:</span><span style="font-weight:600;color:var(--accent-warning);">${currentUser?.redeemable_points || 0} pts</span></div>
              </div>
            </div>
          </div>

          <div class="view-card" style="padding:32px;">
            <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:var(--text-primary);">Personal Details</h3>
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:24px;">Update your basic info and description bio</p>

            <form id="profile-form">
              <div class="form-group">
                <label class="form-label required">Full Name</label>
                <input type="text" class="form-input" id="profile-name" value="${profileForm.name}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Designation</label>
                <input type="text" class="form-input" id="profile-designation" value="${profileForm.designation || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Gender</label>
                <select class="form-input" id="profile-gender">
                  <option value="" ${!profileForm.gender ? 'selected' : ''}>Prefer Not To Say</option>
                  <option value="Male" ${profileForm.gender === 'Male' ? 'selected' : ''}>Male</option>
                  <option value="Female" ${profileForm.gender === 'Female' ? 'selected' : ''}>Female</option>
                  <option value="Non-Binary" ${profileForm.gender === 'Non-Binary' ? 'selected' : ''}>Non-Binary</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Bio</label>
                <textarea class="form-input" id="profile-bio" rows="4" style="resize:vertical;" placeholder="Tell us about your interest in sustainability..." maxlength="250">${profileForm.bio || ''}</textarea>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;text-align:right;"><span id="bio-count">${(profileForm.bio || '').length}</span>/250 characters</div>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px;" id="save-profile-btn">Save Profile Changes</button>
            </form>
          </div>
        </div>

        <style>
          .profile-info-row { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border-color); }
          .profile-info-row:last-child { border-bottom:none; }
        </style>
      </div>
    `;

    const bioInput = container.querySelector('#profile-bio');
    const bioCount = container.querySelector('#bio-count');
    if (bioInput && bioCount) {
      bioInput.addEventListener('input', () => {
        bioCount.textContent = bioInput.value.length;
      });
    }

    const form = container.querySelector('#profile-form');
    const saveBtn = container.querySelector('#save-profile-btn');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      saveBtn.disabled = true;
      saveBtn.textContent = 'Updating...';
      try {
        const data = await put('/auth/me/profile', {
          name: container.querySelector('#profile-name').value,
          designation: container.querySelector('#profile-designation').value,
          gender: container.querySelector('#profile-gender').value,
          bio: container.querySelector('#profile-bio').value,
        });
        localStorage.setItem('esg_user', JSON.stringify(data));
        profileForm = { name: data.name, designation: data.designation || '', gender: data.gender || '', bio: data.bio || '' };
        showToast('Profile updated successfully', 'success');
      } catch (err) {
        showToast('Failed to update profile: ' + err.message, 'error');
      }
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Profile Changes';
    });

    if (window.lucide) window.lucide.createIcons();
  }

  render();
}

function showToast(message, type = 'info') {
  const existing = document.querySelector('.custom-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `custom-toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:var(--radius-sm);
    font-size:13px;font-weight:600;z-index:9999;animation:slideIn 0.3s ease;
    background:${type === 'success' ? 'var(--accent-success)' : type === 'error' ? '#EF4444' : 'var(--bg-card)'};
    color:${type === 'success' || type === 'error' ? '#fff' : 'var(--text-primary)'};
    border:1px solid var(--border-color);box-shadow:var(--shadow-lg);
  `;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}
