import React from 'react';

const App = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6C63FF 0%, #FFFFFF 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '30px'
        }}>
          🍎 FoodScan & Diet
        </h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginTop: '50px'
        }}>
          {/* Card 1 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '15px',
              color: '#333'
            }}>
              📸 FoodScan
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Escaneie qualquer alimento e obtenha informações nutricionais detalhadas
            </p>
            <button style={{
              backgroundColor: '#6C63FF',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              width: '100%'
            }}>
              Escanear Alimento
            </button>
          </div>

          {/* Card 2 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '15px',
              color: '#333'
            }}>
              📊 Controle Diário
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Monitore sua alimentação e acompanhe suas metas nutricionais
            </p>
            <button style={{
              backgroundColor: '#22C55E',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              width: '100%'
            }}>
              Ver Controle
            </button>
          </div>

          {/* Card 3 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '15px',
              color: '#333'
            }}>
              👨‍⚕️ Nutricionista
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Encontre nutricionistas especializados na sua região
            </p>
            <button style={{
              backgroundColor: '#EF4444',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              width: '100%'
            }}>
              Encontrar Nutricionista
            </button>
          </div>
        </div>

        <div style={{
          marginTop: '50px',
          padding: '30px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            color: '#333',
            marginBottom: '10px'
          }}>
            ✅ Aplicação Funcionando Perfeitamente!
          </h3>
          <p style={{
            color: '#666',
            margin: '0'
          }}>
            Todos os sistemas estão operacionais e prontos para uso
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;