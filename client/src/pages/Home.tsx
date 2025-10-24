import Webchat from "@/components/Webchat";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              Assistente Virtual Inteligente
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Bem-vindo à{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Verzel
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Converse com nosso assistente virtual e descubra como podemos transformar seu negócio com soluções inovadoras e personalizadas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                Assistente online agora
              </span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Conversa Natural
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Nosso assistente entende suas necessidades através de uma conversa natural e personalizada.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Agendamento Automático
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Agende reuniões automaticamente com horários disponíveis em tempo real.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Resposta Instantânea
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Receba respostas imediatas e qualificadas sobre nossos produtos e serviços.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Clique no ícone de chat no canto inferior direito e converse com nosso assistente agora mesmo!
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>

      {/* Webchat Component */}
      <Webchat />
    </div>
  );
}

