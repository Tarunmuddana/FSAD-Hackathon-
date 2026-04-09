import { useState, useEffect } from 'react';
import { getProfile, getMyRegistrations, updateResume, deleteResume, updateProfile } from '../services/api';
import SkillBadge from '../components/SkillBadge';

export default function Profile({ user, onUpdateUser, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getProfile(user.id),
      getMyRegistrations(user.id)
    ])
    .then(([vol, userRegs]) => {
      setProfile(vol);
      setRegs(userRegs);
    })
    .finally(() => setLoading(false));
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2000000) return alert("File is too large! Please select a file under 2MB for the demo.");
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64Data = event.target.result;
        const updated = await updateResume(user.id, file.name, base64Data);
        setProfile(updated);
      } catch (err) {
        alert("Failed to upload resume.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to delete your resume?")) return;
    setLoading(true);
    try {
      const updated = await deleteResume(user.id);
      setProfile(updated);
    } catch (err) {
      alert("Failed to delete resume.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading Profile…</p>
      </div>
    );
  }

  const approvedEvents = regs.filter(r => r.status === 'APPROVED');
  const userSkills = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="page-container animate-fadeUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, marginBottom: '0.4rem' }}>My Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your volunteer details and track your impact.</p>
        </div>
        <button onClick={onLogout} className="btn" style={{ background: 'var(--bg-glass)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.5rem 1rem' }}>
          Log Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left Side: Avatar and Stats */}
        <div className="admin-form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '2rem', marginBottom: '1rem'
          }}>
            {profile.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U'}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{profile.name}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{profile.email}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)' }}>{profile.hoursLogged}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hours Logged</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{approvedEvents.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Events Completed</div>
            </div>
          </div>

          <div style={{ width: '100%', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.8rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>My Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {userSkills.length > 0 ? userSkills.map(sk => (
                <SkillBadge key={sk} skill={sk} status="neutral" />
              )) : <span style={{ color: 'var(--text-muted)' }}>No skills added.</span>}
            </div>
          </div>
        </div>

        {/* Right Side: Edit Profile / Settings */}
        <div className="admin-form-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>Edit Profile</h2>
          <form onSubmit={async (e) => { 
            e.preventDefault(); 
            setLoading(true);
            try {
              const name = e.target['profile-name'].value;
              const skills = e.target['profile-skills'].value;
              const updatedVol = await updateProfile(user.id, { name, skills });
              setProfile(updatedVol);
              if (onUpdateUser) onUpdateUser({ ...user, ...updatedVol });
              alert("Profile saved successfully!");
            } catch (err) {
              alert("Error saving profile: " + err.message);
            } finally {
              setLoading(false);
            }
          }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Full Name</label>
              <input id="profile-name" type="text" className="form-control" defaultValue={profile.name} required />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Email Address</label>
              <input type="email" className="form-control" defaultValue={profile.email} required disabled style={{ opacity: 0.6 }} />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Email address cannot be changed for hackathon prototype.</div>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Volunteer Skills (comma separated)</label>
              <input id="profile-skills" type="text" className="form-control" defaultValue={profile.skills} placeholder="e.g. React, Java, Gardening" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.8rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>Resume & Documents</h3>
            
            {profile.resumeName ? (
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', 
                borderRadius: '12px', textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>📄</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{profile.resumeName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Uploaded Document</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a 
                    href={profile.resumeData} 
                    download={profile.resumeName}
                    className="btn btn-sm" 
                    style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', border: 'none', padding: '0.4rem 0.8rem' }}
                    title="Download/View Resume"
                  >
                    View
                  </a>
                  <button 
                    type="button"
                    onClick={handleDeleteResume}
                    className="btn btn-sm" 
                    style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.4rem 0.8rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <label style={{ 
                display: 'block', padding: '2rem', border: '2px dashed var(--border-subtle)', 
                borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)', 
                cursor: 'pointer', transition: 'all 0.2s ease', background: 'var(--bg-glass-hover)'
              }}>
                <input type="file" style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📤</span>
                <span style={{ fontWeight: 600 }}>Click to upload your resume</span>
                <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', opacity: 0.7 }}>Accepts PDF, DOCX (Max 2MB)</div>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
