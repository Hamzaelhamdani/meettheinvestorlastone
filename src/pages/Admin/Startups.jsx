import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button, Input, Card, Select } from '../../components/Common/UI';
import { Rocket, Upload, Link as LinkIcon, FileText, Globe, Trash2, Plus, Image, Pencil, X } from 'lucide-react';

const SECTORS = [
    { label: 'Select Sector', value: '' },
    { label: 'Fintech', value: 'Fintech' },
    { label: 'Healthtech', value: 'Healthtech' },
    { label: 'Edtech', value: 'Edtech' },
    { label: 'Agritech', value: 'Agritech' },
    { label: 'E-commerce', value: 'E-commerce' },
    { label: 'AI/ML', value: 'AI/ML' },
    { label: 'SaaS', value: 'SaaS' },
    { label: 'CleanTech', value: 'CleanTech' },
    { label: 'Web3 / Crypto', value: 'Web3' },
    { label: 'DeepTech', value: 'DeepTech' },
    { label: 'Creative Tech', value: 'Creative Tech' },
    { label: 'Logistics / Supply Chain', value: 'Logistics' },
    { label: 'Proptech / Real Estate', value: 'Proptech' },
    { label: 'Cybersecurity', value: 'Cybersecurity' },
    { label: 'Gaming / Entertainment', value: 'Gaming' },
    { label: 'HRTech', value: 'HRTech' },
    { label: 'Mobility / Transport', value: 'Mobility' },
    { label: 'RetailTech', value: 'RetailTech' },
    { label: 'FoodTech', value: 'FoodTech' },
    { label: 'Insurtech', value: 'Insurtech' },
    { label: 'Biotech', value: 'Biotech' },
    { label: 'GovTech', value: 'GovTech' },
    { label: 'MarTech / AdTech', value: 'MarTech' },
    { label: 'Other', value: 'Other' },
];

const CATEGORIES = [
    { label: 'Select Category', value: '' },
    { label: 'Pre-seed', value: 'Pre-seed' },
    { label: 'Seed', value: 'Seed' },
    { label: 'Series A', value: 'Series A' },
    { label: 'Series B', value: 'Series B' },
    { label: 'Series C+', value: 'Series C+' },
    { label: 'Growth', value: 'Growth' },
];

const COUNTRIES = [
    { label: 'Select Country', value: '' },
    // Europe
    { label: 'France', value: 'France' },
    { label: 'Spain', value: 'Spain' },
    { label: 'Germany', value: 'Germany' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Belgium', value: 'Belgium' },
    { label: 'Switzerland', value: 'Switzerland' },
    { label: 'Italy', value: 'Italy' },
    { label: 'Netherlands', value: 'Netherlands' },
    { label: 'Greece', value: 'Greece' },
    { label: 'Austria', value: 'Austria' },
    { label: 'Hungary', value: 'Hungary' },
    { label: 'Ireland', value: 'Ireland' },
    { label: 'Finland', value: 'Finland' },
    { label: 'Sweden', value: 'Sweden' },
    { label: 'Cyprus', value: 'Cyprus' },
    // Africa
    { label: 'Morocco', value: 'Morocco' },
    { label: 'Tunisia', value: 'Tunisia' },
    { label: 'Egypt', value: 'Egypt' },
    { label: 'Algeria', value: 'Algeria' },
    { label: 'Mauritania', value: 'Mauritania' },
    { label: 'Ivory Coast', value: 'Ivory Coast' },
    { label: 'Gabon', value: 'Gabon' },
    { label: 'Senegal', value: 'Senegal' },
    { label: 'Mali', value: 'Mali' },
    { label: 'Congo (DRC)', value: 'Congo (DRC)' },
    { label: 'Madagascar', value: 'Madagascar' },
    { label: 'Niger', value: 'Niger' },
    { label: 'Benin', value: 'Benin' },
    { label: 'Cameroon', value: 'Cameroon' },
    { label: 'Ethiopia', value: 'Ethiopia' },
    { label: 'Guinea', value: 'Guinea' },
    { label: 'Liberia', value: 'Liberia' },
    { label: 'South Africa', value: 'South Africa' },
    { label: 'Ghana', value: 'Ghana' },
    { label: 'Central African Republic', value: 'CAR' },
    { label: 'Botswana', value: 'Botswana' },
    { label: 'Kenya', value: 'Kenya' },
    { label: 'Nigeria', value: 'Nigeria' },
    { label: 'Sierra Leone', value: 'Sierra Leone' },
    // America
    { label: 'United States', value: 'USA' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Guadeloupe', value: 'Guadeloupe' },
    { label: 'Martinique', value: 'Martinique' },
    { label: 'French Guiana', value: 'French Guiana' },
    { label: 'Saint Barthélemy', value: 'Saint Barthelemy' },
    { label: 'Saint Martin', value: 'Saint Martin' },
    { label: 'Dominica', value: 'Dominica' },
    { label: 'Bolivia', value: 'Bolivia' },
    { label: 'Chile', value: 'Chile' },
    { label: 'Honduras', value: 'Honduras' },
    { label: 'Mexico', value: 'Mexico' },
    // Middle East
    { label: 'Saudi Arabia', value: 'Saudi Arabia' },
    { label: 'UAE', value: 'UAE' },
    { label: 'Bahrain', value: 'Bahrain' },
    { label: 'Jordan', value: 'Jordan' },
    { label: 'Kuwait', value: 'Kuwait' },
    // Asia/Oceania
    { label: 'Turkey', value: 'Turkey' },
    { label: 'Poland', value: 'Poland' },
    { label: 'Romania', value: 'Romania' },
    { label: 'Russia', value: 'Russia' },
    { label: 'Albania', value: 'Albania' },
    { label: 'Armenia', value: 'Armenia' },
    { label: 'Croatia', value: 'Croatia' },
    { label: 'Malta', value: 'Malta' },
    { label: 'Mauritius', value: 'Mauritius' },
    { label: 'Maldives', value: 'Maldives' },
    { label: 'Philippines', value: 'Philippines' },
    { label: 'Vietnam', value: 'Vietnam' },
    { label: 'Other', value: 'Other' },
];

const AdminStartups = () => {
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingStartup, setEditingStartup] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        sector: '',
        category: '',
        country: '',
        one_line_pitch: '',
        demo_url: '',
    });
    const [file, setFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchStartups();
    }, []);

    const fetchStartups = async () => {
        const { data, error } = await supabase
            .from('startups')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setStartups(data || []);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            sector: '',
            category: '',
            country: '',
            one_line_pitch: '',
            demo_url: '',
        });
        setFile(null);
        setLogoFile(null);
        setEditingStartup(null);
        setShowForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleEdit = (startup) => {
        setEditingStartup(startup);
        setFormData({
            name: startup.name || '',
            sector: startup.sector || '',
            category: startup.category || '',
            country: startup.country || '',
            one_line_pitch: startup.one_line_pitch || '',
            demo_url: startup.demo_url || '',
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let pitch_deck_url = editingStartup?.pitch_deck_url || '';
            let logo_url = editingStartup?.logo_url || '';

            // 1. Upload pitch deck if new file selected
            if (file) {
                setUploading(true);
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('pitch_decks')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('pitch_decks')
                    .getPublicUrl(fileName);

                pitch_deck_url = publicUrl;
            }

            // 2. Upload logo if new file selected
            if (logoFile) {
                const logoExt = logoFile.name.split('.').pop();
                const logoName = `logo_${Math.random()}.${logoExt}`;

                const { error: logoError } = await supabase.storage
                    .from('pitch_decks')
                    .upload(logoName, logoFile);

                if (logoError) throw logoError;

                const { data: { publicUrl: logoPublicUrl } } = supabase.storage
                    .from('pitch_decks')
                    .getPublicUrl(logoName);

                logo_url = logoPublicUrl;
            }

            if (editingStartup) {
                // UPDATE existing startup
                const { error: updateError } = await supabase
                    .from('startups')
                    .update({
                        ...formData,
                        pitch_deck_url: pitch_deck_url || null,
                        logo_url: logo_url || null
                    })
                    .eq('id', editingStartup.id);

                if (updateError) throw updateError;
            } else {
                // INSERT new startup
                const { error: insertError } = await supabase
                    .from('startups')
                    .insert([{ ...formData, pitch_deck_url, logo_url }]);

                if (insertError) throw insertError;
            }

            resetForm();
            fetchStartups();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this startup?')) return;

        const { error } = await supabase
            .from('startups')
            .delete()
            .eq('id', id);

        if (!error) fetchStartups();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Startup Dealflow</h2>
                    <p className="text-slate-400">Manage companies participating in the matchmaking</p>
                </div>
                {!showForm && (
                    <Button onClick={() => { resetForm(); setShowForm(true); }}>
                        <Plus className="mr-2" size={18} />
                        Add Startup
                    </Button>
                )}
            </div>

            {showForm && (
                <Card
                    title={editingStartup ? `Edit: ${editingStartup.name}` : "New Startup Details"}
                    subtitle={editingStartup ? "Modify the startup information below" : "All fields are required for a complete profile"}
                    className="border-primary-500/20 shadow-primary-500/5"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Startup Name" name="name" value={formData.name} onChange={handleInputChange} required />
                            <Select
                                label="Sector"
                                name="sector"
                                value={formData.sector}
                                onChange={handleInputChange}
                                options={SECTORS}
                                required
                            />
                            <Select
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                options={CATEGORIES}
                                required
                            />
                            <Select
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                options={COUNTRIES}
                                required
                            />
                        </div>

                        <Input label="One Line Pitch" name="one_line_pitch" value={formData.one_line_pitch} onChange={handleInputChange} placeholder="Describe the startup in 10 words or less" required />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input label="Demo URL (YouTube/Vimeo)" name="demo_url" value={formData.demo_url} onChange={handleInputChange} placeholder="https://..." />

                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-sm font-medium text-slate-400 ml-1">
                                    Logo (Image) {editingStartup?.logo_url && <span className="text-green-500 text-xs">• Current logo set</span>}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files && setLogoFile(e.target.files[0])}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-slate-700 border-dashed rounded-xl text-slate-400 cursor-pointer hover:border-primary-500 hover:text-primary-400 transition-all"
                                    >
                                        <Image size={18} />
                                        {logoFile ? logoFile.name : "Choose Logo"}
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-sm font-medium text-slate-400 ml-1">
                                    Pitch Deck (Document) {editingStartup?.pitch_deck_url && <span className="text-green-500 text-xs">• Current deck set</span>}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept=".pdf,.ppt,.pptx,.doc,.docx,.key,.odp"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-slate-700 border-dashed rounded-xl text-slate-400 cursor-pointer hover:border-primary-500 hover:text-primary-400 transition-all"
                                    >
                                        <Upload size={18} />
                                        {file ? file.name : "Choose File"}
                                    </label>
                                </div>
                                <p className="text-[10px] text-slate-600 ml-1">PDF, PPT, PPTX, DOC, DOCX accepted</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" type="button" onClick={resetForm}>
                                <X size={16} className="mr-1" />
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={loading}>
                                {editingStartup ? "Update Startup" : "Save Startup Profile"}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {startups.map((startup) => (
                    <Card key={startup.id} className="group hover:border-white/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform overflow-hidden">
                                {startup.logo_url ? (
                                    <img src={startup.logo_url} alt={startup.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Globe size={24} />
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEdit(startup)}
                                    className="text-slate-600 hover:text-primary-400 p-2 transition-colors"
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(startup.id)}
                                    className="text-slate-600 hover:text-red-400 p-2 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h4 className="text-xl font-bold text-white mb-1">{startup.name}</h4>
                        <div className="flex gap-2 mb-3 flex-wrap">
                            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-md border border-primary-500/20">
                                {startup.sector}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                                {startup.country}
                            </span>
                        </div>

                        <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                            {startup.one_line_pitch}
                        </p>

                        <div className="flex items-center gap-2 mt-auto">
                            {startup.pitch_deck_url && (
                                <a
                                    href={startup.pitch_deck_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                                >
                                    <FileText size={14} />
                                    Deck
                                </a>
                            )}
                            {startup.demo_url && (
                                <a
                                    href={startup.demo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                                >
                                    <LinkIcon size={14} />
                                    Demo
                                </a>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminStartups;
