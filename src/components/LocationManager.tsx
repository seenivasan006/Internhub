import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LocationManager = () => {
    const { user, updateUser } = useAuth();
    const [prompted, setPrompted] = useState(false);

    useEffect(() => {
        // Prevent prompting if already done in this session or if user already has location
        const sessionPrompt = sessionStorage.getItem('locationPrompted');
        if (sessionPrompt || prompted) return;

        const requestLocation = () => {
            if (!navigator.geolocation) return;

            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    if (data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
                        const state = data.address.state || '';

                        // Only update if data is different from current
                        if (city !== user?.location || state !== user?.state) {
                            const updateRes = await fetch('/api/profile/settings', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    location: city,
                                    state: state,
                                    // Preserve other fields
                                    preferred_language: user?.preferred_language,
                                    gender: user?.gender,
                                    skills: user?.skills
                                })
                            });

                            if (updateRes.ok) {
                                const result = await updateRes.json();
                                updateUser(result.user);
                                console.log('📍 Location updated automatically:', city, state);
                            }
                        }
                    }
                } catch (err) {
                    console.error("Auto-location detection failed", err);
                } finally {
                    sessionStorage.setItem('locationPrompted', 'true');
                    setPrompted(true);
                }
            }, (error) => {
                console.warn("Location access denied or unavailable:", error.message);
                sessionStorage.setItem('locationPrompted', 'true');
                setPrompted(true);
            }, { timeout: 10000 });
        };

        // Check if we should prompt
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                if (result.state === 'prompt') {
                    requestLocation();
                } else if (result.state === 'granted') {
                    // Just update silently if already granted
                    requestLocation();
                }
            });
        } else {
            // Fallback for browsers that don't support permissions API
            requestLocation();
        }

    }, [user, updateUser, prompted]);

    return null; // This component doesn't render anything
};
