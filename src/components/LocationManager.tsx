import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestLocation } from '../services/locationService';

export const LocationManager = () => {
    const { user, updateUser } = useAuth();
    const [prompted, setPrompted] = useState(false);

    useEffect(() => {
        // Prevent prompting if already done in this session or if user already has location
        const sessionPrompt = sessionStorage.getItem('locationPrompted');
        if (sessionPrompt || prompted) return;

        const handleAutoLocation = async () => {
            try {
                const { city, state } = await requestLocation();
                
                if (city || state) {
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
        };

        // Check if we should prompt
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(result => {
                if (result.state === 'prompt' || result.state === 'granted') {
                    handleAutoLocation();
                }
            });
        } else {
            // Fallback for browsers that don't support permissions API
            handleAutoLocation();
        }

    }, [user, updateUser, prompted]);

    return null; // This component doesn't render anything
};
