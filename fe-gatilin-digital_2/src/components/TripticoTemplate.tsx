import { forwardRef } from 'react';
import { type CofradiaDetalle, type Evento } from '@/services/apis/api-normal';

interface TripticoTemplateProps {
    detail: CofradiaDetalle;
    eventos: Evento[];
    displayColor: string;
}

// Paletas festivas para decoraciones
const festivePalette = {
    plumaje: ['#FF007F', '#FFEB3B', '#00E5FF', '#FFFFFF'],
    mascara: ['#FFC107', '#D32F2F', '#E0E0E0'],
    textil: ['#2962FF', '#FF9800', '#00C853', '#1B5E20']
};

const TripticoTemplate = forwardRef<HTMLDivElement, TripticoTemplateProps>(
    ({ detail, eventos, displayColor }, ref) => {
        // Agrupar eventos por fecha (igual que en CofradiaDetail)
        const eventosAgrupados = Object.entries(
            eventos.reduce((acc, evento) => {
                if (!acc[evento.fecha]) {
                    acc[evento.fecha] = [];
                }
                acc[evento.fecha].push(evento);
                return acc;
            }, {} as Record<string, Evento[]>)
        ).sort(([dateA], [dateB]) => {
            const [dayA, monthA, yearA] = dateA.split('/').map(Number);
            const [dayB, monthB, yearB] = dateB.split('/').map(Number);
            const dateObjA = new Date(yearA, monthA - 1, dayA);
            const dateObjB = new Date(yearB, monthB - 1, dayB);
            return dateObjA.getTime() - dateObjB.getTime();
        });

        // Calcular cuántos grupos de fechas caben en cada panel (3 paneles de eventos)
        const totalGrupos = eventosAgrupados.length;
        // Distribuir equitativamente entre los 3 paneles
        const gruposPanel3 = Math.ceil(totalGrupos / 3);
        const gruposPanel4 = Math.ceil((totalGrupos - gruposPanel3) / 2);
        const gruposPanel5 = totalGrupos - gruposPanel3 - gruposPanel4;
        
        // Componente de tiras festivas decorativas
        const FestiveStripes = ({ colors }: { colors: string[] }) => (
            <>
                {colors.map((color, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: `${i * 15}px`,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 20px, transparent 20px, transparent 30px)`,
                            opacity: 0.3
                        }}
                    />
                ))}
            </>
        );

        return (
            <div ref={ref} style={{ display: 'none', position: 'fixed', left: '-9999px', top: 0 }}>
                {/* ==================== CARA 1 (PÁGINA 1) ==================== */}
                <div style={{
                    width: '297mm',
                    height: '210mm',
                    backgroundColor: '#121212',
                    fontFamily: 'Arial, sans-serif',
                    pageBreakAfter: 'always',
                    position: 'relative'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: '100%', gap: '0' }}>
                        
                        {/* PANEL 1: PORTADA CON LOGO */}
                        <div style={{
                            backgroundColor: '#121212',
                            padding: '25px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRight: '1px solid #333'
                        }}>
                            <FestiveStripes colors={festivePalette.plumaje} />
                            
                            {/* Logo */}
                            <div style={{ 
                                textAlign: 'center',
                                position: 'relative',
                                zIndex: 1,
                                marginTop: '40px'
                            }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    margin: '0 auto',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `3px solid ${displayColor}`,
                                    boxShadow: `0 0 30px ${displayColor}40`,
                                    overflow: 'hidden'
                                }}>
                                    <img 
                                        src="/images/logo.svg" 
                                        alt="Logo" 
                                        style={{ 
                                            width: '90px', 
                                            height: '90px', 
                                            objectFit: 'contain',
                                            filter: `drop-shadow(0 0 10px ${displayColor})`
                                        }} 
                                    />
                                </div>
                            </div>

                            {/* Título principal */}
                            <div style={{
                                textAlign: 'center',
                                position: 'relative',
                                zIndex: 1,
                                padding: '20px',
                                backgroundColor: 'rgba(0,0,0,0.4)',
                                borderRadius: '15px',
                                border: `2px solid ${displayColor}40`
                            }}>
                                <h1 style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: displayColor,
                                    marginBottom: '10px',
                                    textShadow: `0 0 20px ${displayColor}80`,
                                    lineHeight: '1.1',
                                    textTransform: 'uppercase'
                                }}>
                                    {detail.nickname_cofradia}
                                </h1>
                                <div style={{
                                    width: '60px',
                                    height: '3px',
                                    background: `linear-gradient(90deg, transparent, ${displayColor}, transparent)`,
                                    margin: '10px auto'
                                }} />
                                <p style={{
                                    fontSize: '12px',
                                    color: '#FFFFFF',
                                    opacity: 0.8,
                                    fontWeight: '500',
                                    letterSpacing: '1px'
                                }}>
                                    FESTIVIDAD DE LOS NEGRITOS
                                </p>
                                <p style={{
                                    fontSize: '11px',
                                    color: '#FFFFFF',
                                    opacity: 0.6,
                                    marginTop: '5px'
                                }}>
                                    Huánuco - Perú
                                </p>
                            </div>

                            {/* Footer con tiras decorativas */}
                            <div style={{
                                position: 'relative',
                                zIndex: 1,
                                textAlign: 'center',
                                paddingTop: '20px',
                                borderTop: `2px solid ${displayColor}30`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '10px' }}>
                                    {festivePalette.mascara.map((color, i) => (
                                        <div key={i} style={{ width: '30px', height: '4px', backgroundColor: color, borderRadius: '2px' }} />
                                    ))}
                                </div>
                                <p style={{ fontSize: '9px', color: '#666', letterSpacing: '1px' }}>GATILINDIGITAL</p>
                            </div>
                        </div>

                        {/* PANEL 2: INFORMACIÓN Y DATOS */}
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            padding: '25px',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRight: '1px solid #333'
                        }}>
                            <FestiveStripes colors={festivePalette.textil} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {/* Título sección */}
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '20px',
                                    padding: '12px',
                                    background: `linear-gradient(135deg, ${displayColor}20, transparent)`,
                                    borderRadius: '10px',
                                    border: `1px solid ${displayColor}40`
                                }}>
                                    <h2 style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: displayColor,
                                        marginBottom: '5px'
                                    }}>
                                        NUESTRA IDENTIDAD
                                    </h2>
                                    <div style={{
                                        width: '40px',
                                        height: '2px',
                                        background: displayColor,
                                        margin: '0 auto'
                                    }} />
                                </div>

                                {/* Datos principales */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{
                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        borderLeft: `4px solid ${displayColor}`,
                                        boxShadow: `0 0 15px ${displayColor}20`
                                    }}>
                                        <p style={{ fontSize: '10px', color: '#999', marginBottom: '4px', letterSpacing: '1px' }}>📅 FUNDACIÓN</p>
                                        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFF' }}>{detail.fecha_fundacion || 'Tradición centenaria'}</p>
                                    </div>
                                    
                                    <div style={{
                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        borderLeft: `4px solid ${festivePalette.plumaje[1]}`,
                                        boxShadow: '0 0 15px rgba(255,235,59,0.1)'
                                    }}>
                                        <p style={{ fontSize: '10px', color: '#999', marginBottom: '4px', letterSpacing: '1px' }}>📍 DISTRITO</p>
                                        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFF' }}>{detail.distrito || 'Huánuco'}</p>
                                    </div>

                                    <div style={{
                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        borderLeft: `4px solid ${festivePalette.textil[1]}`,
                                        boxShadow: '0 0 15px rgba(255,152,0,0.1)'
                                    }}>
                                        <p style={{ fontSize: '10px', color: '#999', marginBottom: '4px', letterSpacing: '1px' }}>👤 REPRESENTANTE</p>
                                        <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#FFF' }}>{detail.nombre_representante || 'Directiva de la Cofradía'}</p>
                                    </div>

                                    <div style={{
                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        borderLeft: `4px solid ${festivePalette.textil[2]}`,
                                        boxShadow: '0 0 15px rgba(0,200,83,0.1)'
                                    }}>
                                        <p style={{ fontSize: '10px', color: '#999', marginBottom: '4px', letterSpacing: '1px' }}>🏛️ SEDE</p>
                                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#FFF', lineHeight: '1.3' }}>{detail.sede_local || 'Centro de Huánuco'}</p>
                                    </div>
                                </div>

                                {/* Decoración con imagen del niño Jesús */}
                                <div style={{
                                    marginTop: '15px',
                                    textAlign: 'center',
                                    padding: '15px',
                                    background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))`,
                                    borderRadius: '12px',
                                    border: `1px solid ${displayColor}30`,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <img 
                                        src="/images/nino-jesus.webp" 
                                        alt="Niño Jesús" 
                                        style={{ 
                                            width: '80px', 
                                            height: '80px', 
                                            objectFit: 'cover',
                                            borderRadius: '10px',
                                            marginBottom: '8px',
                                            opacity: 0.8,
                                            filter: `drop-shadow(0 0 10px ${displayColor})`
                                        }} 
                                    />
                                    <p style={{ fontSize: '11px', color: '#CCC', fontStyle: 'italic' }}>
                                        &quot;Unidos en tradición y fe&quot;
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* PANEL 3: CRONOGRAMA (PARTE 1) */}
                        <div style={{
                            backgroundColor: '#0a0a0a',
                            padding: '25px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <FestiveStripes colors={festivePalette.mascara} />

                            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* Título */}
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '15px',
                                    padding: '10px',
                                    background: `linear-gradient(135deg, ${displayColor}30, transparent)`,
                                    borderRadius: '10px',
                                    border: `1px solid ${displayColor}`
                                }}>
                                    <h2 style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: displayColor,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        📅 CRONOGRAMA
                                    </h2>
                                </div>

                                {/* Eventos agrupados por fecha */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    flex: 1,
                                    overflow: 'hidden'
                                }}>
                                    {eventosAgrupados.slice(0, gruposPanel3).map(([fecha, eventosDelDia], grupoIndex) => (
                                        <div key={grupoIndex} style={{ marginBottom: '6px' }}>
                                            {/* Header de fecha */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '6px'
                                            }}>
                                                <div style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    backgroundColor: displayColor,
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    boxShadow: `0 0 10px ${displayColor}40`
                                                }}>
                                                    <div style={{
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        color: '#000',
                                                        lineHeight: '1'
                                                    }}>
                                                        {fecha.split('/')[0]}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '8px',
                                                        color: '#000',
                                                        opacity: 0.7,
                                                        marginTop: '2px'
                                                    }}>
                                                        {fecha.split('/')[1]}
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        color: '#FFF',
                                                        marginBottom: '2px'
                                                    }}>
                                                        {eventosDelDia[0].tipo_dia || 'Día de Actividades'}
                                                    </p>
                                                    <p style={{ fontSize: '8px', color: '#666' }}>{fecha}</p>
                                                </div>
                                            </div>

                                            {/* Grid de eventos del día */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '5px'
                                            }}>
                                                {eventosDelDia
                                                    .sort((a, b) => a.hora.localeCompare(b.hora))
                                                    .map((evento, eventoIndex) => (
                                                    <div key={eventoIndex} style={{
                                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                                        padding: '7px',
                                                        borderRadius: '6px',
                                                        borderLeft: `3px solid ${displayColor}`,
                                                        boxShadow: `0 0 10px ${displayColor}10`,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'flex-start',
                                                        minHeight: '55px'
                                                    }}>
                                                        {/* Hora */}
                                                        <div style={{
                                                            backgroundColor: `${displayColor}20`,
                                                            color: displayColor,
                                                            padding: '3px 6px',
                                                            borderRadius: '4px',
                                                            fontSize: '10px',
                                                            fontWeight: 'bold',
                                                            display: 'inline-block',
                                                            alignSelf: 'flex-start',
                                                            marginBottom: '5px'
                                                        }}>
                                                            {evento.hora.substring(0, 5)}
                                                        </div>

                                                        {/* Título */}
                                                        <h4 style={{
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            color: '#FFF',
                                                            lineHeight: '1.3',
                                                            margin: 0,
                                                            flex: 1
                                                        }}>
                                                            {evento.tipo_evento}
                                                        </h4>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {(gruposPanel4 > 0 || gruposPanel5 > 0) && (
                                    <div style={{
                                        textAlign: 'center',
                                        marginTop: '10px',
                                        padding: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        border: `1px solid ${displayColor}30`
                                    }}>
                                        <p style={{ fontSize: '9px', color: '#999', fontStyle: 'italic' }}>
                                            ➡️ Continúa en la siguiente página...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== CARA 2 (PÁGINA 2) ==================== */}
                <div style={{
                    width: '297mm',
                    height: '210mm',
                    backgroundColor: '#121212',
                    fontFamily: 'Arial, sans-serif',
                    position: 'relative'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: '100%', gap: '0' }}>
                        
                        {/* PANEL 4: CRONOGRAMA (PARTE 2) */}
                        <div style={{
                            backgroundColor: '#0a0a0a',
                            padding: '25px',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRight: '1px solid #333'
                        }}>
                            <FestiveStripes colors={festivePalette.plumaje} />

                            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {gruposPanel4 > 0 ? (
                                    <>
                                        <div style={{
                                            textAlign: 'center',
                                            marginBottom: '15px',
                                            padding: '10px',
                                            background: `linear-gradient(135deg, ${displayColor}30, transparent)`,
                                            borderRadius: '10px',
                                            border: `1px solid ${displayColor}`
                                        }}>
                                            <h2 style={{
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                color: displayColor,
                                                textTransform: 'uppercase'
                                            }}>
                                                📅 CRONOGRAMA
                                            </h2>
                                            <p style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>(Continuación)</p>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px',
                                            flex: 1,
                                            overflow: 'hidden'
                                        }}>
                                            {eventosAgrupados.slice(gruposPanel3, gruposPanel3 + gruposPanel4).map(([fecha, eventosDelDia], grupoIndex) => (
                                                <div key={grupoIndex} style={{ marginBottom: '6px' }}>
                                                    {/* Header de fecha */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '6px'
                                                    }}>
                                                        <div style={{
                                                            width: '45px',
                                                            height: '45px',
                                                            backgroundColor: displayColor,
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                            boxShadow: `0 0 10px ${displayColor}40`
                                                        }}>
                                                            <div style={{
                                                                fontSize: '16px',
                                                                fontWeight: 'bold',
                                                                color: '#000',
                                                                lineHeight: '1'
                                                            }}>
                                                                {fecha.split('/')[0]}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '8px',
                                                                color: '#000',
                                                                opacity: 0.7,
                                                                marginTop: '2px'
                                                            }}>
                                                                {fecha.split('/')[1]}
                                                            </div>
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{
                                                                fontSize: '11px',
                                                                fontWeight: 'bold',
                                                                color: '#FFF',
                                                                marginBottom: '2px'
                                                            }}>
                                                                {eventosDelDia[0].tipo_dia || 'Día de Actividades'}
                                                            </p>
                                                            <p style={{ fontSize: '8px', color: '#666' }}>{fecha}</p>
                                                        </div>
                                                    </div>

                                                    {/* Grid de eventos del día */}
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: '5px'
                                                    }}>
                                                        {eventosDelDia
                                                            .sort((a, b) => a.hora.localeCompare(b.hora))
                                                            .map((evento, eventoIndex) => (
                                                            <div key={eventoIndex} style={{
                                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                                padding: '7px',
                                                                borderRadius: '6px',
                                                                borderLeft: `3px solid ${displayColor}`,
                                                                boxShadow: `0 0 10px ${displayColor}10`,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'flex-start',
                                                                minHeight: '55px'
                                                            }}>
                                                                {/* Hora */}
                                                                <div style={{
                                                                    backgroundColor: `${displayColor}20`,
                                                                    color: displayColor,
                                                                    padding: '3px 6px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '10px',
                                                                    fontWeight: 'bold',
                                                                    display: 'inline-block',
                                                                    alignSelf: 'flex-start',
                                                                    marginBottom: '5px'
                                                                }}>
                                                                    {evento.hora.substring(0, 5)}
                                                                </div>

                                                                {/* Título */}
                                                                <h4 style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: 'bold',
                                                                    color: '#FFF',
                                                                    lineHeight: '1.3',
                                                                    margin: 0,
                                                                    flex: 1
                                                                }}>
                                                                    {evento.tipo_evento}
                                                                </h4>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.3 }}>🎉</div>
                                        <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                                            Todos los eventos<br/>en la página anterior
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PANEL 5: CRONOGRAMA (PARTE 3) */}
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            padding: '25px',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRight: '1px solid #333'
                        }}>
                            <FestiveStripes colors={festivePalette.textil} />

                            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {gruposPanel5 > 0 ? (
                                    <>
                                        <div style={{
                                            textAlign: 'center',
                                            marginBottom: '15px',
                                            padding: '10px',
                                            background: `linear-gradient(135deg, ${displayColor}30, transparent)`,
                                            borderRadius: '10px',
                                            border: `1px solid ${displayColor}`
                                        }}>
                                            <h2 style={{
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                color: displayColor,
                                                textTransform: 'uppercase'
                                            }}>
                                                📅 CRONOGRAMA
                                            </h2>
                                            <p style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>(Continuación)</p>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px',
                                            flex: 1,
                                            overflow: 'hidden'
                                        }}>
                                            {eventosAgrupados.slice(gruposPanel3 + gruposPanel4).map(([fecha, eventosDelDia], grupoIndex) => (
                                                <div key={grupoIndex} style={{ marginBottom: '6px' }}>
                                                    {/* Header de fecha */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '6px'
                                                    }}>
                                                        <div style={{
                                                            width: '45px',
                                                            height: '45px',
                                                            backgroundColor: displayColor,
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                            boxShadow: `0 0 10px ${displayColor}40`
                                                        }}>
                                                            <div style={{
                                                                fontSize: '16px',
                                                                fontWeight: 'bold',
                                                                color: '#000',
                                                                lineHeight: '1'
                                                            }}>
                                                                {fecha.split('/')[0]}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '8px',
                                                                color: '#000',
                                                                opacity: 0.7,
                                                                marginTop: '2px'
                                                            }}>
                                                                {fecha.split('/')[1]}
                                                            </div>
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{
                                                                fontSize: '11px',
                                                                fontWeight: 'bold',
                                                                color: '#FFF',
                                                                marginBottom: '2px'
                                                            }}>
                                                                {eventosDelDia[0].tipo_dia || 'Día de Actividades'}
                                                            </p>
                                                            <p style={{ fontSize: '8px', color: '#666' }}>{fecha}</p>
                                                        </div>
                                                    </div>

                                                    {/* Grid de eventos del día */}
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: '5px'
                                                    }}>
                                                        {eventosDelDia
                                                            .sort((a, b) => a.hora.localeCompare(b.hora))
                                                            .map((evento, eventoIndex) => (
                                                            <div key={eventoIndex} style={{
                                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                                padding: '7px',
                                                                borderRadius: '6px',
                                                                borderLeft: `3px solid ${displayColor}`,
                                                                boxShadow: `0 0 10px ${displayColor}10`,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'flex-start',
                                                                minHeight: '55px'
                                                            }}>
                                                                {/* Hora */}
                                                                <div style={{
                                                                    backgroundColor: `${displayColor}20`,
                                                                    color: displayColor,
                                                                    padding: '3px 6px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '10px',
                                                                    fontWeight: 'bold',
                                                                    display: 'inline-block',
                                                                    alignSelf: 'flex-start',
                                                                    marginBottom: '5px'
                                                                }}>
                                                                    {evento.hora.substring(0, 5)}
                                                                </div>

                                                                {/* Título */}
                                                                <h4 style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: 'bold',
                                                                    color: '#FFF',
                                                                    lineHeight: '1.3',
                                                                    margin: 0,
                                                                    flex: 1
                                                                }}>
                                                                    {evento.tipo_evento}
                                                                </h4>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        textAlign: 'center',
                                        padding: '30px'
                                    }}>
                                        <div style={{
                                            width: '120px',
                                            height: '120px',
                                            margin: '0 auto 20px',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `2px solid ${displayColor}30`,
                                            boxShadow: `0 0 30px ${displayColor}20`
                                        }}>
                                            <div style={{ fontSize: '60px', opacity: 0.4 }}>🎭</div>
                                        </div>
                                        <h3 style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: displayColor,
                                            marginBottom: '10px'
                                        }}>
                                            {detail.nickname_cofradia}
                                        </h3>
                                        <p style={{ fontSize: '12px', color: '#999', fontStyle: 'italic', lineHeight: '1.6' }}>
                                            Una tradición que se vive<br/>
                                            con el corazón<br/>
                                            en cada celebración
                                        </p>
                                        {detail.nombre_cofradia && (
                                            <div style={{
                                                marginTop: '20px',
                                                padding: '12px',
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                borderRadius: '10px',
                                                border: `1px solid ${displayColor}30`
                                            }}>
                                                <p style={{ fontSize: '9px', color: '#999', marginBottom: '5px' }}>NOMBRE OFICIAL</p>
                                                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#FFF', lineHeight: '1.3' }}>
                                                    {detail.nombre_cofradia}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PANEL 6: INFORMACIÓN FINAL CON IMAGEN */}
                        <div style={{
                            backgroundColor: '#121212',
                            padding: '25px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <FestiveStripes colors={festivePalette.mascara} />

                            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                {/* Imagen principal del Niño Jesús */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '140px',
                                        height: '140px',
                                        margin: '0 auto 20px',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `3px solid ${displayColor}40`,
                                        boxShadow: `0 0 30px ${displayColor}30`,
                                        overflow: 'hidden'
                                    }}>
                                        <img 
                                            src="/images/nino-jesus.webp" 
                                            alt="Niño Jesús de Huánuco" 
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'cover',
                                                filter: 'brightness(0.9) contrast(1.1)'
                                            }} 
                                        />
                                    </div>
                                    <div style={{
                                        padding: '12px',
                                        background: `linear-gradient(135deg, ${displayColor}20, transparent)`,
                                        borderRadius: '10px',
                                        marginBottom: '20px',
                                        border: `1px solid ${displayColor}40`
                                    }}>
                                        <p style={{ fontSize: '14px', color: displayColor, fontWeight: 'bold', marginBottom: '5px' }}>
                                            NIÑO JESÚS DE HUÁNUCO
                                        </p>
                                        <p style={{ fontSize: '10px', color: '#999', fontStyle: 'italic' }}>
                                            Patrono de la festividad
                                        </p>
                                    </div>
                                </div>

                                {/* Mensaje inspirador */}
                                <div style={{
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: `1px solid ${displayColor}30`,
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '35px', marginBottom: '12px' }}>🎭</div>
                                    <h3 style={{
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        color: '#FFF',
                                        marginBottom: '10px',
                                        lineHeight: '1.4'
                                    }}>
                                        Una tradición que se vive con el corazón
                                    </h3>
                                    <p style={{ fontSize: '10px', color: '#999', lineHeight: '1.5', fontStyle: 'italic' }}>
                                        Danza, música y fe en honor al Niño Jesús.
                                        Más de 200 años de tradición huanuqueña.
                                    </p>
                                </div>

                                {/* Footer final con decoración */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        padding: '12px',
                                        background: `linear-gradient(135deg, ${displayColor}30, transparent)`,
                                        borderRadius: '10px',
                                        border: `1px solid ${displayColor}`,
                                        marginBottom: '12px'
                                    }}>
                                        <p style={{ fontSize: '12px', color: '#FFF', fontWeight: 'bold', marginBottom: '5px' }}>
                                            🎉 ¡ÚNETE A NOSOTROS! 🎉
                                        </p>
                                        <p style={{ fontSize: '9px', color: '#999' }}>
                                            Vive la tradición huanuqueña
                                        </p>
                                    </div>

                                    {/* Barra decorativa de colores */}
                                    <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                                        {[...festivePalette.plumaje.slice(0, 3), ...festivePalette.textil.slice(0, 2)].map((color, i) => (
                                            <div key={i} style={{
                                                flex: 1,
                                                height: '5px',
                                                backgroundColor: color,
                                                borderRadius: '2px'
                                            }} />
                                        ))}
                                    </div>

                                    <div style={{
                                        padding: '10px',
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        borderRadius: '8px',
                                        border: '1px solid #333'
                                    }}>
                                        <p style={{ fontSize: '11px', color: displayColor, fontWeight: 'bold', marginBottom: '5px' }}>
                                            GATILINDIGITAL
                                        </p>
                                        <p style={{ fontSize: '8px', color: '#666', letterSpacing: '1px' }}>
                                            TRADICIÓN • CULTURA • COMUNIDAD
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

TripticoTemplate.displayName = 'TripticoTemplate';

export default TripticoTemplate;
